import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AnalyceService } from '@app/core/services/analyze.service';
import { AlertService, DateTimeUtil, Network, ResponseI, RoutingRolesService, SpinnerService } from '@app/core';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';

declare var window: any;

@Component({
  selector: 'app-analyze-log',
  templateUrl: './analyze-log.component.html',
  styleUrls: ['../analyze.component.scss'],
})
export class AnalyzeLogComponent implements OnInit {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  response!: ResponseI;
  networksList: Network[] = [];
  catalogBroadcastList: any[] = [];
  
  formModal: any;
  modalExportCdr: any;
  selectedLog: any = null;
  showFilterPanel = false;
  showExportButton = false;
  searchValue: string = '';
  messageShow: string = '';

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
    private spinnerService: SpinnerService,
    private alertSvc: AlertService,
    private router: Router,
  ) {}

  toggleFilter(): void {
    this.showFilterPanel = !this.showFilterPanel;
  }

  async ngOnInit() {
    this.formModal = new window.bootstrap.Modal(document.getElementById('modalCdr'),)
    this.modalExportCdr = new window.bootstrap.Modal(document.getElementById('modalExportCdr'),);
    this.dtOptions = {};

    this.assignDefaultDates();

    await this.loadNetworks();
    await this.loadCatalog();
    this.loadDtOptions();
  }

  private assignDefaultDates(): void {
  const now = DateTime.local();
  const startOfToday = now.startOf('day');
  const endOfToday = now.endOf('day');

  this.filters.start_datetime = startOfToday.toFormat("yyyy-MM-dd'T'HH:mm:ss");
  this.filters.end_datetime = endOfToday.toFormat("yyyy-MM-dd'T'HH:mm:ss");
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

  loadDtOptions(): void {
    this.dtOptions = {
      serverSide: true,
      processing: true,
      searching: false,
      paging: true,
      lengthChange: true,
      pageLength: 25,
      scrollX: false,
      autoWidth: true,
      columnDefs: [
        { targets: '_all', className: 'dt-nowrap' }
      ],
      ajax: async (dataTablesParameters: any, callback) => {
        this.spinnerService.showSpinner();
        const offset = Math.floor(dataTablesParameters.start / dataTablesParameters.length) + 1;
        const limit = dataTablesParameters.length;

        try {
          const response: any = await this.analyceService.getLogs(offset, limit, this.filters);
          const result = response?.data || {};

          const enrichedData = (result.data || []).map((item: any) => {
            const originNetwork = this.networksList.find(n => n.network_id == item.origination_network_id);
            const destinationNetwork = this.networksList.find(n => n.network_id == item.destination_network_id);
            const broadcast = this.catalogBroadcastList.find(b => b.broadcast_id == item.broadcast_id);
            const broadcastUser = broadcast ? broadcast.user_name : null;
            
            return {
              ...item,
              submit_date: DateTimeUtil.toUtcFromLocal(item.submit_date),
              delivery_date: DateTimeUtil.toUtcFromLocal(item.delivery_date),
              origination_network_name: originNetwork ? originNetwork.name : 'Unknown',
              destination_network_name: destinationNetwork ? destinationNetwork.name : 'Unknown',
              broadcast_id: broadcast ? broadcast.broadcast_id : null,
              broadcast_name: broadcast ? broadcast.broadcast_name : null,
              broadcast_user_name: broadcastUser,
            };
          });

          this.showExportButton = enrichedData.length > 0;

          callback({
            recordsTotal: result.total_elements || 0,
            recordsFiltered: result.total_elements || 0,
            data: enrichedData || []
          });
        } catch (error) {
          callback({ recordsTotal: 0, recordsFiltered: 0, data: [] });
        } finally {
          setTimeout(() => {
            this.spinnerService.hideSpinner();
          }, 500);
        }
      },
      columns: [
        { data: 'submit_date' },
        { data: 'addr_src_digits' },
        { data: 'addr_dst_digits' },
        { data: 'origination_network_name' },
        { data: 'destination_network_name' },
        { data: 'message' },
        { data: 'status' },
        {
          data: null,
          orderable: false,
          render: () => `<button class="btn btn-red btn-sm show-modal-btn"><i class='bx bx-show'></i></button>`
        }
      ],
      createdRow: (row: Node, data: any) => {
        const button = (row as HTMLElement).querySelector('.show-modal-btn');
        if (button) {
          button.addEventListener('click', () => {
            this.showModal(data);
          });
        }
      }
    };
  }

  showModal(item: any): void {
    this.selectedLog = item;
    this.formModal.show();
  }

  closeModal(): void {
    this.selectedLog = null;
    this.formModal.hide();
  }

  exportLogs(): void {
    this.messageShow = 'Please confirm to export the logs with the current filter parameters.';
    this.modalExportCdr.show();
  }

  async onConfirmExport(confirm: boolean) {
    this.modalExportCdr.hide();

    if (confirm) {
      const response = await this.analyceService.exportCdrs(this.filters, 'CDRS');
      if (response.status === 200) {
        this.alertSvc.success('Exporting logs...', 'The export process has started.');
      }
      this.router.navigate(['/pages/analyze/download-cdr']);
    }
  }

  onSearch(value: string): void {
    this.searchValue = value;
    if (value && value.trim() !== '') {
      this.filters.search_filter = value;
    } else {
      this.filters.search_filter = null;
    }

    this.filters.search_filter = value;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      if (value && value.trim() !== '') {
        dtInstance.page('first').draw('page');
      } else {
        this.refresh();
      }
    });
  }

  applyFilters(filters: any): void {
    this.filters = filters;
    this.refresh();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  refresh(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
}
