import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { BroadCastService, RoutingRolesService, AlertService, Statistic, DateTimeUtil, Catalog, CatalogService, Network } from '@core/index';
import { DateTime } from 'luxon';

declare var window: any;

@Component({
  selector: 'app-broadcast-view',
  templateUrl: './view.component.html',
  styleUrls: ['../add/add.component.scss']
})
export class ViewComponent implements OnInit {

  fileColumns: string[] = [];
  filePreview: string[] = [];
  encodingList: Catalog[] = [
    { id: 0, name: 'DCS-0' },
    { id: 3, name: 'DCS-3' },
    { id: 8, name: 'DCS-8' },
  ];
  tonCatalog: Catalog[] = [];
  npiCatalog: Catalog[] = [];
  columnMapping: { [key: string]: string } = {};
  messagePreview: string = '';
  data: any;
  roles: string[] = [];
  canApprove: boolean = false;
  canReject: boolean = false;
  canCancel: boolean = false;
  showAdvancedSettings: boolean = false;
  statistics: Statistic = this.getInitialStatistics();

  selectedAction: 'APPROVED' | 'REJECTED' | 'CANCELED' | null = null;
  actionComment: string = '';
  public formModal: any;
  confirmationMessage: string = '';
  confirmationSubMessage: string = '';
  confirmationNote1: string = '';
  confirmationNote2: string = '';
  forceImmediate: boolean = false;
  serviceProviderList: Network[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private broadCastService: BroadCastService,
    private catalogService: CatalogService,
    private alertSvr: AlertService,
    private cdr: ChangeDetectorRef,
    private routingService: RoutingRolesService,
  ) {}

  ngOnInit(): void {
    this.loadProviders();
    this.getTonCatalog();
    this.getNpiCatalog();
    this.getRoles().then(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.loadDataForm({ broadcast_id: +id });
      }
    });

    this.formModal = new window.bootstrap.Modal(document.getElementById('modalChangeStatusBroadcast'),)
  }

  async getRoles(): Promise<string[]> {
    const roles = localStorage.getItem('roles');
    this.roles = roles && roles !== "undefined" ? JSON.parse(roles) : [];
    return this.roles;
  }

  getDate(date: string): string {
    return DateTimeUtil.toUtcFromLocal(date) || '';
  }

  async loadProviders() {
      const response = await this.routingService.getNetworks();
      if (response.status === 200) {
        this.serviceProviderList = response.data.filter((p: { protocol: string; }) => p.protocol === 'HTTP');
      }
  }

  async getTonCatalog() {
    const resp = await this.catalogService.getByCatalogType('toncatalog');
    if (resp.status == 200) {
      this.tonCatalog = resp.data;
    }
  }

  async getNpiCatalog() {
    const resp = await this.catalogService.getByCatalogType('npicatalog');
    if (resp.status == 200) {
      this.npiCatalog = resp.data;
    }
  }

  get providerName(): string {
      const provider = this.serviceProviderList.find(p => p.network_id === this.data?.broadcast?.network_id);
      return provider?.name || 'Unknown';
  }

  private getInitialStatistics(): Statistic {
    return {
      total_message: 0,
      pending: 0,
      enqueue: 0,
      sent: 0,
      failed: 0,
      duplicated: 0,
      invalid: 0
    };
  }

  private updateButtonVisibility(status: string, maxExecutionDatetime: string): void {
    const hasPermission = this.roles.includes('ROOT') || this.roles.includes('CAMPAIGN_APPROVER');
    const maxDate = DateTimeUtil.toLocalDateTime(maxExecutionDatetime);
    const now = DateTime.local();

    if (!hasPermission) {
      this.canApprove = false;
      this.canReject = false;
      this.canCancel = false;
      return;
    }
  
    const isExpired = maxDate ? now > maxDate : true;

    if (status === 'PENDING') {
      this.canApprove = !isExpired;
      this.canReject = true;
      this.canCancel = false;
    } else if (status === 'SCHEDULED' || status === 'PROCESSING' || status === 'CREATING' || status === 'CREATED') {
      this.canApprove = false;
      this.canReject = false;
      this.canCancel = true;
    } else {
      this.canApprove = false;
      this.canReject = false;
      this.canCancel = false;
    }
  }

  async loadDataForm(data: any): Promise<void> {
    const response = await this.broadCastService.getBroadCastById(data.broadcast_id);
    if (response.status !== 200) {
      this.alertSvr.showAlert(2, response.message, response.comment);
      this.router.navigate(['/pages/broadcast']);
      return;
    }

    this.data = response.data;
    this.statistics = response.data.statistics || this.getInitialStatistics();
    const broadcast = response.data.broadcast;
    const firstRecordMapping = response.data?.first_record_mapping;

    this.columnMapping = { ...broadcast.column_mapping };
    this.fileColumns = Object.keys(this.columnMapping);
    this.filePreview = this.fileColumns.map(col => firstRecordMapping?.[col] || '');
    this.onMessageTemplateChange();
    this.cdr.detectChanges();
    this.updateButtonVisibility(broadcast.status, broadcast.max_execution_datetime);
  }

  toggleAdvancedSettings(): void {
    this.showAdvancedSettings = !this.showAdvancedSettings;
  }

  onMessageTemplateChange(): void {
    const template = this.data?.broadcast?.message_template;
    if (!template) {
      this.messagePreview = '';
      return;
    }
    let preview = template;

    const variableRegex = /{{\s*(\w+)\s*}}/g;
    preview = preview.replace(variableRegex, (match: any, variableName: string) => {
      const colIndex = this.fileColumns.findIndex(col => col === variableName);
      if (colIndex !== -1) {
        return this.filePreview[colIndex] || '';
      }
      return match;
    });
  
    this.messagePreview = preview;
    this.cdr.detectChanges();
  }

  openConfirmation(action: 'APPROVED' | 'REJECTED' | 'CANCELED'): void {
    this.selectedAction = action;
    this.actionComment = '';

    const isImmediate = this.data?.broadcast?.is_immediate;
    const startDatetime = this.data?.broadcast?.start_datetime;
    const now = DateTime.local();
    const start = startDatetime ? DateTimeUtil.toLocalDateTime(startDatetime) : null;

    if (action === 'APPROVED') {
      if (isImmediate) {
        this.confirmationMessage = 'Warning: Immediate Execution Campaign';
        this.confirmationSubMessage = 'This campaign is set to be sent <strong>immediately after approval</strong>.';
        this.confirmationNote1 = 'If everything looks good, feel free to proceed.';
        this.confirmationNote2 = 'If you believe it should go out at a later time, you might want to double-check with the sender before approving.';
      } else if (start && now > start) {
        this.confirmationMessage = 'Warning: Campaign Scheduled with a Past Start Time';
        this.confirmationSubMessage = 'This campaign was scheduled with a start time that has already passed.';
        this.confirmationNote1 = 'Once approved, it will be sent <strong>immediately</strong>.';
        this.confirmationNote2 = 'If this wasn’t the intended behavior, you may want to reach out to the sender to confirm or request a schedule update before proceeding.';

        this.forceImmediate = true;
      } else {
        this.confirmationMessage = 'Are you sure you want to approve this broadcast?';
        this.confirmationSubMessage = '';
      }
    } else if (action === 'REJECTED') {
      this.confirmationMessage = 'Are you sure you want to reject this broadcast?';
      this.confirmationSubMessage = 'Once rejected, the campaign will not be executed and will require a new configuration to proceed.';
    } else if (action === 'CANCELED') {
      this.confirmationMessage = 'Are you sure you want to cancel this broadcast?';
      this.confirmationSubMessage = 'The campaign will be stopped and no further messages will be sent.';
    }

    this.formModal.show();
  }

  async confirmStatusChange(): Promise<void> {
    if (!this.selectedAction) return;
  
    const id = this.data?.broadcast?.id;

    if (!id) {
      this.alertSvr.showAlert(2, 'Error', 'Broadcast ID is missing.');
      return;
    }

    const response = await this.broadCastService.changeStatusBroadcast(id, this.selectedAction, this.actionComment);
  
    this.formModal.hide();
  
    if (response.status === 200) {
      this.alertSvr.showAlert(1, 'Success', response.message);
      this.router.navigate(['/pages/broadcast']);
    } else {
      this.alertSvr.showAlert(2, 'Error', response.message);
    }
  }

  objectKeys = Object.keys;
}
