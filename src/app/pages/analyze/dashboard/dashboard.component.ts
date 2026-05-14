import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AnalyceService } from '@app/core/services/analyze.service';
import { AlertService, DashboardData, Network, ResponseI, RoutingRolesService, SpinnerService } from '@app/core';
import { Chart, ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DateTime } from 'luxon';

declare var window: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['../analyze.component.scss'],
})
export class DashboardComponent implements OnInit {

  chartWidth: string = '100%';
  chartHeight: number = 450;
  response!: ResponseI;
  showFilterPanel: boolean = false;
  networksList: Network[] = [];
  catalogBroadcastList: any[] = [];
  dashboardData!: DashboardData;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Total SMS Traffic',
        fill: false,
        tension: 0.4,
        borderColor: '#6c757d',
        pointBackgroundColor: '#6c757d',
      },
      {
        data: [],
        label: 'SMS Entregados',
        fill: false,
        tension: 0.4,
        borderColor: '#7B3031',
        pointBackgroundColor: '#7B3031',
      },
      {
        data: [],
        label: 'Failed SMS',
        fill: false,
        tension: 0.4,
        borderColor: '#A0A0A0',
        pointBackgroundColor: '#A0A0A0',
      },
    ],
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'category',
        ticks: {
          autoSkip: false,
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'start', 
        labels: {
          color: '#6c757d',
          font: {
            size: 14,
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
        },
      },
      zoom: {
        pan: {
          enabled: true,  
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
      }
    },
  };

  filters: any = {
    start_datetime: null,
    end_datetime: null,
    message_type: null,
    status: null,
    origin_type: null,
    origin_protocol: null,
    destination_protocol: null,
    destination_type: null,
    source_addr: null,
    destination_addr: null,
    origin_network: null,
    destination_network: null,
    registered_delivery: null,
    broadcast_filter_id: null,
    broadcast_filter_user: null,
  };

  constructor(
    private analyceService: AnalyceService,
    private routingRolesService: RoutingRolesService,
    private changeDetectorRef: ChangeDetectorRef,
    private spinnerService: SpinnerService,
    private alertSvc: AlertService,
  ) {}

  async ngOnInit() {
    Chart.register({
      id: 'legendMargin',
      beforeInit(chart: any) {
        const originalFit = chart.legend.fit;
        chart.legend.fit = function () {
          originalFit.bind(chart.legend)();
          this.height += 30;
        };
      }
    });

    this.assignDefaultDates(7);

    this.initializeDashboardData();
    await this.loadNetworks();
    await this.loadCatalog();
    await this.getData();
  }

  private assignDefaultDates(daysBack: number = 7): void {
    const now = DateTime.local();
    const defaultStart = now.minus({ days: daysBack });

    const formattedStart = defaultStart.toFormat("yyyy-MM-dd'T'HH:mm");
    const formattedEnd = now.toFormat("yyyy-MM-dd'T'HH:mm");

    this.filters.start_datetime = formattedStart;
    this.filters.end_datetime = formattedEnd;
  }

  async loadNetworks() {
    this.response = await this.routingRolesService.getNetworks();
    if (this.response.status == 200) {
      this.networksList = this.response.data;
    }
  }

  async loadCatalog() {
    this.response = await this.analyceService.getCatalog();
    if (this.response.status == 200) {
      this.catalogBroadcastList = this.response.data;
    }
  }

  async getData() {
    this.spinnerService.showSpinner();
    this.response = await this.analyceService.getDashboardData(this.filters);
    if (this.response.status == 200) {
      this.dashboardData = this.response.data;
      this.updateChartData();
    } else {
      this.initializeDashboardData();
      this.spinnerService.hideSpinner();
    }
  }

  toggleFilter(): void {
    this.showFilterPanel = !this.showFilterPanel;
  }

  applyFilters(filters: any): void {
    this.filters = filters;
    this.getData();
  }

  updateChartData(): void {
    const stats = this.dashboardData.data;
    const labels = stats.map(d => d.date);
    const allValues = stats.flatMap(d => [d.total, d.sms_delivery, d.sms_failed]);
    const maxValue = Math.max(...allValues);
    
    const labelCount = labels.length;

    if (labelCount <= 15) {
      this.chartWidth = '100%';
    } else {
      this.chartWidth = `${labelCount * 100}px`;
    }

    this.chartHeight =
      maxValue >= 200000000 ? 700 :
      maxValue >= 100000000 ? 600 : 450;

    this.lineChartData = {
      labels,
      datasets: [
        {
          data: stats.map(d => d.total),
          label: 'Total SMS Traffic',
          fill: false,
          tension: 0,
          borderColor: '#6c757d',
          pointBackgroundColor: '#6c757d',
        },
        {
          data: stats.map(d => d.sms_delivery),
          label: 'SMS Delivery Rate',
          fill: false,
          tension: 0,
          borderColor: '#009254',
          pointBackgroundColor: '#009254',
        },
        {
          data: stats.map(d => d.sms_failed),
          label: 'Failed SMS',
          fill: false,
          tension: 0,
          borderColor: '#7B3031',
          pointBackgroundColor: '#7B3031',
        }
      ]
    };

    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
      this.chart?.update();
      this.spinnerService.hideSpinner();
    }, 600);
  }


  formatNumber(value: number): string {
    const format = (num: number, suffix: string) => {
      return parseFloat(num.toFixed(2)).toString() + suffix;
    };

    if (value >= 1000000) return format(value / 1000000, 'M');
    return value.toString();
  }

  private initializeDashboardData(): void {
    this.dashboardData = {
      total: 0,
      data: [],
      sms_failed: 0,
      sms_delivery: 0,
      sms_failed_rate: 0,
      sms_delivery_rate: 0,
    };

    this.lineChartData = {
      labels: [],
      datasets: []
    };
  }
}