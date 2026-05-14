import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject, interval, Subscription } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ResponseI, Broadcast, AuthService, DateTimeUtil } from '@core/index';
import { BroadCastService, AlertService, DataTableConfigService } from '@core/index';
import { Router } from '@angular/router';

declare var window: any;

@Component({
  selector: 'app-broadcast',
  templateUrl: './broadcast.component.html',
})
export class BroadCastComponent implements OnInit {

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  dataTable: any;
  response!: ResponseI;
  data: Broadcast[] = [];
  itemBroadcast!: Broadcast;
  broadcastId!: number;
  messageShow!: string;
  public module: any;
  public formModal: any;
  public formModalStart: any;
  public showActionStatus: any;
  public run: boolean = false;
  public downloading: { [key: number]: boolean } = {};
  private statusSubscription: Subscription | null = null;
  private fileDownloadSubscription!: Subscription;
  fileContent: string = '';
  currentFileName: string = '';
  roles: string[] = [];
  canOperate: boolean = false;
  invalidDuplicateStatus = ['DRAFT', 'FAILED', 'CREATING', 'UPDATING'];
  allowRefreshStatistics = ['PROCESSING', 'COMPLETED'];
  allowedDeleteStatuses: string[] = ['DRAFT', 'FAILED', 'REJECTED', 'COMPLETED'];
  isRemove: boolean = false;
  isAdmin: boolean = false;
  currentUserId: number | null = null;

  constructor(
    private broadCastService: BroadCastService,
    private authService: AuthService,
    private alertsvr: AlertService,
    private dtConfigService: DataTableConfigService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.getCurrentUser();
    this.getRoles();
    this.loadDtOptions();
    this.loadBroadcasts();
    this.formModal = new window.bootstrap.Modal(document.getElementById('modalBroadcastStatistics'),)
    this.formModalStart = new window.bootstrap.Modal(document.getElementById('modalStartBroadcast'),)
    this.showActionStatus = new window.bootstrap.Modal(document.getElementById('modalActionStatus'),);
  }

  async getRoles() {
    this.roles = await this.authService.getRoles() || [];
    const allowedRoles = ['ROOT', 'CAMPAIGN_APPROVER', 'CAMPAIGN_OPERATOR'];
    this.canOperate = this.roles.some(role => allowedRoles.includes(role));
    this.isAdmin = this.roles.some(role => ['ROOT'].includes(role));
  }

  async getCurrentUser() {
    this.currentUserId = await this.authService.getUserId();
  }

  getDate(date: string): string {
    return DateTimeUtil.toUtcFromLocal(date) || '';
  }

  async loadBroadcasts() {
    this.response = await this.broadCastService.getBroadCast();
    if (this.response.status == 200) {
      this.data = this.response.data;
      this.data.sort((a, b) => b.broadcast_id - a.broadcast_id);
    }
    this.dtTrigger.next(this.dtOptions);
  }

  onCloneBroadcast(broadcast: Broadcast) {
    this.isRemove = false;
    this.formModalStart.show();
    this.broadcastId = broadcast.broadcast_id;
    this.messageShow = 'Are you sure you want to clone this broadcast?';
  }

  async onCloseModalStartBroadcast(band: boolean) {
    this.formModalStart.hide();
    if (band) {
      const response = await this.broadCastService.startBroadCast(this.broadcastId);
      if (response.status == 200) {
        this.alertsvr.success(response.message, 'Success');
      } else {
        this.alertsvr.error(response.message, 'Error');
      }
      this.renderer();
    }
  }

  async onConfirmBroadcastAction(confirm: boolean) {
    this.formModalStart.hide();

    if (!confirm) return;

    if (this.isRemove && this.itemBroadcast) {
      const response = await this.broadCastService.changeStatusBroadcast(
        this.itemBroadcast.broadcast_id,
        'DELETED',
        `Broadcast deleted with status: ${this.itemBroadcast.status}`
      );

      if (response.status === 200) {
        this.alertsvr.success(response.comment, 'Success');
      } else {
        this.alertsvr.error(response.comment, 'Error');
      }

    } else {
      const response = await this.broadCastService.cloneBroadcast(this.broadcastId);

      if (response.status === 200) {
        this.alertsvr.success(response.comment, 'Success');
      } else {
        this.alertsvr.error(response.comment, 'Error');
      }
    }

    this.renderer();
  }

  async downloadFile(broadcast: Broadcast) {
    this.downloading[broadcast.broadcast_id] = true;

    try {
      const fileResponse = await this.broadCastService.requestFileDownload(broadcast.broadcast_id);
      if (fileResponse.status !== 200) {
        this.alertsvr.error('Error initiating file download: ' + fileResponse.message);
        this.downloading[broadcast.broadcast_id] = false;
        return;
      }

      let { data } = fileResponse;

      if (data.status == 'FAILED') {
        this.alertsvr.error('Error initiating file download: ' + data.message);
        this.downloading[broadcast.broadcast_id] = false;
        return;
      }

      const fileId = data.id;
      this.currentFileName = data.filename;

      this.monitorFileStatus(fileId, broadcast.broadcast_id, data.token);
    } catch (error) {
      this.alertsvr.error('Error initiating file download: ' + error);
      this.downloading[broadcast.broadcast_id] = false;
    }
  }

  monitorFileStatus(fileId: number, broadcastId: number, token: string) {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }

    this.statusSubscription = interval(5000).subscribe(async () => {
      try {
        const statusResponse = await this.broadCastService.checkFileStatus(fileId);

        if (statusResponse.status === 200) {
          if (statusResponse.data.status === 'CREATED') {
            await this.broadCastService.downloadReportStream(token)
            this.alertsvr.success('File download starting successfully');
            this.downloading[broadcastId] = false;
            this.statusSubscription?.unsubscribe();
          } else if (statusResponse.data.status === 'FAILED') {
            this.alertsvr.error('File creation failed');
            this.downloading[broadcastId] = false;
            this.statusSubscription?.unsubscribe();
          }
        } else {
          this.alertsvr.error('Error checking file status: ' + statusResponse.message);
          this.downloading[broadcastId] = false;
          this.statusSubscription?.unsubscribe();
        }
      } catch (error) {
        this.alertsvr.error('Error monitoring file status: ' + error);
        this.downloading[broadcastId] = false;
        this.statusSubscription?.unsubscribe();
      }
    });
  }

  showModal(id: number) {
    this.broadcastId = id;
    this.formModal.show();
  }

  onCloseModal() {
    this.broadcastId = 0;
    this.formModal.hide();
  }

  renderer() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadBroadcasts();
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.statusSubscription?.unsubscribe();

    if (this.fileDownloadSubscription) {
      this.fileDownloadSubscription.unsubscribe();
    }
  }

  showErrorStatus(message: any) {
    this.messageShow = message;
    this.showActionStatus.show();
  }

  onDeleteBroadcast(broadcast: Broadcast) {
    this.isRemove = true;
    this.itemBroadcast = broadcast;
    this.messageShow = `Are you sure you want to delete the broadcast: ${broadcast.name}?`;
    this.formModalStart.show();
  }

  refresh() {
    this.renderer();
  }

  loadDtOptions() {
    this.dtOptions = {
      ...this.dtConfigService.getConfig(),
      initComplete: () => {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.on('length.dt', (e: Event, settings: any, len: number) => {
            this.onPageLengthChange(len);
          });
        });
      }
    };
    this.dtTrigger.next({ ...this.dtOptions });
  }

  onPageLengthChange(newPageLength: number): void {
    this.dtConfigService.updateConfig({ pageLength: newPageLength });
    this.dtOptions.pageLength = newPageLength;
  }

  goToView(broadcastId: number): void {
    this.router.navigate(['/pages/broadcast/view', broadcastId]);
  }

  goToEdit(broadcastId: number): void {
    if (!this.canOperate) return;
    this.router.navigate(['/pages/broadcast/edit', broadcastId]);
  }

  canDelete(broadcast: Broadcast): boolean {
    if (broadcast.status !== 'DRAFT') {
      return false;
    }

    if (this.isAdmin) {
      return true;
    }

    if (!this.canOperate) return false;

    if (!broadcast.created_by_id || !this.currentUserId) {
      return false;
    }

    const match = broadcast.created_by_id === this.currentUserId;
    return match;
  }
}
