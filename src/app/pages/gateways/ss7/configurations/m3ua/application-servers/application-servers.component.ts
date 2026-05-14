import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { M3uaService, M3uaApplicationServer, AlertService, M3uaGeneralSettings, DataTableConfigService } from '@app/core';
import { M3uaSettingsService } from '@app/core/services/m3ua-settings.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Subscription } from 'rxjs';

declare var window: any;

@Component({
  selector: 'app-application-servers',
  templateUrl: './application-servers.component.html',
})
export class ApplicationServersComponent implements OnInit, OnDestroy {
  @ViewChild(DataTableDirective, {static: false})
  dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  listApplicationServers: M3uaApplicationServer[] = [];
  modal!: any;
  modalDeleteAppServer!: any;
  messageShow: string = '';
  appServer!: M3uaApplicationServer;
  dataServer: any;
  itemOption!: number;
  module:any;
  m3uaSettings?: M3uaGeneralSettings;
  private subscriptions = new Subscription();

  constructor(
    private m3uaService: M3uaService, 
    private alertsrv: AlertService, 
    private m3uaSettingsService: M3uaSettingsService,
    private dtConfigService: DataTableConfigService,
  ) { }

  ngOnInit(): void {
    this.loadDtOptions();
    this.modal = new window.bootstrap.Modal(document.getElementById('modalAddAppServer'));
    this.modalDeleteAppServer = new window.bootstrap.Modal(document.getElementById('modalDeleteAppServer'));
    this.subscriptions.add(this.m3uaSettingsService.data$.subscribe(settings => {
      if (settings) {
        this.m3uaSettings = settings;
      }
    }));
    this.loadData();
  }

  async loadData() {

    let response = await this.m3uaService.getApplicationServersList(this.m3uaSettings!.id);
    if (response.status === 200) {
      this.listApplicationServers = response.data;
    }
    this.dtTrigger.next(this.dtOptions);
  }

  showModal(e: boolean) {
    if (!e) { return; }

    this.dataServer = null;
    this.modal.show();
  }

  editData(appServer: any) {
    this.dataServer = {
      dataServer: appServer
    }
    this.modal.show();
  }

  onCloseModal(refresh: boolean) {
    this.dataServer = null;
    this.modal.hide();
    if (refresh) {
      this.renderer();
    }
  }

  async showDeleteModal(appServer: M3uaApplicationServer) {
    this.appServer = appServer;
    this.messageShow = 'Are you sure you want to delete the application server?';
    this.modalDeleteAppServer.show();
  }

  async deleteApplicationServer() {
    try {
      let message = 'Delete Application Server';
      let resp = await this.m3uaService.deleteApplicationServers(this.appServer.id); // Adapt this call to your actual service method
      if (resp.status === 200) {
        this.alertsrv.showAlert(1, message, resp.comment);
      } else {
        this.alertsrv.showAlert(2, 'Could not delete the application server', 'Warning');
      }
    } catch (error) {
      this.alertsrv.showAlert(3, 'Server error', 'Error');
    } finally {

    }
      this.renderer();
  }
  async onCloseModalDelete(band: boolean) {
    this.modalDeleteAppServer.hide();
    if (band) {
      await this.deleteApplicationServer();
    }
    this.loadData();
  }

  renderer() {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.loadData();
      });
    }
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.subscriptions.unsubscribe();
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
  }

  onPageLengthChange(newPageLength: number): void {
    this.dtConfigService.updateConfig({ pageLength: newPageLength });
    this.dtOptions.pageLength = newPageLength;
  }

}
