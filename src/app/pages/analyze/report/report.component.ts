import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AnalyceService } from '@app/core/services/analyze.service';
import { AlertService, Network, ResponseI, RoutingRolesService, SpinnerService, REPORT_NAME_MAP, REPORT_OPTIONS } from '@app/core';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { FormBuilder, FormGroup } from '@angular/forms';

declare var window: any;

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['../analyze.component.scss'],
})
export class ReportComponent implements OnInit {
  
  response!: ResponseI;
  networksList: Network[] = [];
  catalogBroadcastList: any[] = [];
  filtersForm!: FormGroup;
  
  modalExportCdr: any;
  showFilterPanel = false;
  showExportButton = false;
  messageShow: string = '';

  readonly reportOptions = REPORT_OPTIONS.filter(option => option.value !== 'ALL');

  broadcastNameList: any[] = [];
  broadcastUserList: any[] = [];

  constructor(
    private analyceService: AnalyceService,
    private routingRolesService: RoutingRolesService,
    private fb: FormBuilder,
    private spinnerService: SpinnerService,
    private alertSvc: AlertService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  toggleFilter(): void {
    this.showFilterPanel = !this.showFilterPanel;
  }

  async ngOnInit() {
    this.filtersForm = this.fb.group({
      report_type: ['SUMMARY_CDR_ACCOUNT'],
      start_datetime: [null],
      end_datetime: [null],
      source_addr: [null],
      destination_addr: [null],
      origin_network: [null],
      destination_network: [null],
      status: [null],
      message_type: [null],
      origin_type: [null],
      destination_type: [null],
      origin_protocol: [null],
      destination_protocol: [null],
      registered_delivery: [null],
      broadcast_filter_id: [null],
      broadcast_filter_user: [null],
    });

    this.modalExportCdr = new window.bootstrap.Modal(document.getElementById('modalExportReport'),);

    await this.loadNetworks();
    await this.loadCatalog();
    this.assignDefaultDates(7);
  }

  private assignDefaultDates(daysBack: number = 7): void {
    const now = DateTime.local();
    const defaultStart = now.minus({ days: daysBack });

    const formattedStart = defaultStart.toFormat("yyyy-MM-dd'T'HH:mm");
    const formattedEnd = now.toFormat("yyyy-MM-dd'T'HH:mm");

    this.filtersForm.patchValue({
      start_datetime: formattedStart,
      end_datetime: formattedEnd,
    });
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
      this.updateBroadcastOptions();
    }
  }

  private updateBroadcastOptions() {
    const broadcastIds = new Map();
    const userIds = new Map();

    const broadcastNames: any[] = [];
    const broadcastUsers: any[] = [];

    for (const item of this.catalogBroadcastList) {
      if (!broadcastIds.has(item.broadcast_id)) {
        broadcastNames.push({ id: item.broadcast_id, name: item.broadcast_name });
        broadcastIds.set(item.broadcast_id, true);
      }
      if (!userIds.has(item.user_id)) {
        broadcastUsers.push({ id: item.user_id, name: item.user_name });
        userIds.set(item.user_id, true);
      }
    }

    this.broadcastNameList = broadcastNames;
    this.broadcastUserList = broadcastUsers;

    this.changeDetectorRef.detectChanges();
  }

  exportLogs(): void {
    this.messageShow = 'Please confirm to export the logs with the current filter parameters.';
    this.modalExportCdr.show();
  }

  async onConfirmExport(confirm: boolean) {
    this.modalExportCdr.hide();
    if (confirm) {
      this.spinnerService.showSpinner();
      let filter = this.filtersForm.value;

      let filterType = filter.report_type || 'SUMMARY_CDR_ACCOUNT';
      delete filter.report_type;
      const response = await this.analyceService.exportCdrs(filter, filterType);
      if (response.status === 200) {
        setTimeout(() => {
          this.alertSvc.success('Exporting logs...', 'The export process has started.');
        }, 500);
      }
      this.router.navigate(['/pages/analyze/download-report']);
    }
  }
}
