import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Subscription } from 'rxjs';
import { environment } from '@env/environment';
import { cleanObject } from '@core/index';
import { AlertService, SmppServerConfig, SettingServices, DataTableConfigService } from '@app/core';

declare var window: any;

@Component({
  selector: 'app-smpp',
  templateUrl: './smpp.component.html',
})
export class SmppComponent implements OnInit {

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  smppServerConfig: SmppServerConfig[] = [];
  env = environment;
  public itemSmppServer!: SmppServerConfig;
  public itemOption!: number;
  public messageShow!: string;
  public formModalSmppServer: any;
  public formModalConfirmation: any;
  public showActionStatus: any;
  public module: any;

  public defaultObjet: SmppServerConfig = {
    id: 0,
    name: '',
    ip: '127.0.0.1',
    port: 0,
    transaction_timer: 5000,
    wait_for_bind: 5000,
    processor_degree: 15,
    queue_capacity: 1000,
    status: this.env.ServiceProviderDefaults.status,
    enabled: this.env.ServiceProviderDefaults.enabled,
    is_default: false,
    action_status: '',
    tls_enabled: false
  };
  private subscription!: Subscription;
  
  constructor(
    private settingServices: SettingServices,
    private dtConfigService: DataTableConfigService,
    private alertsvr: AlertService,
  ) {}

  ngOnInit(): void {
    this.loadDtOptions();
    this.getSmppServerConfig();
    this.formModalSmppServer = new window.bootstrap.Modal(document.getElementById('modalSmppServer'),);
    this.formModalConfirmation = new window.bootstrap.Modal(document.getElementById('modalSmppServerConfirmation'),);
    this.showActionStatus = new window.bootstrap.Modal(document.getElementById('modalActionStatus'),); 
  }

  editData(smppServer: any, disableControls?:boolean) {
    this.module = {
      title: 'Edit Item',
      smppServer: smppServer,
      disableControls: disableControls
    }
    this.showModal(true);
  }

  deleteSmppServer(smppServer: any) {
    this.itemSmppServer = smppServer;
    this.formModalConfirmation.show();
    this.itemOption = 3;
    this.messageShow = 'Are you sure you want to delete the smpp server?';
  }

  showErrorStatus(message: any) {
    this.messageShow = message;
    this.showActionStatus.show();
  }

  async changeEnabledStatus(smppServerConfig: any, isStarted: boolean) {
    this.itemSmppServer = smppServerConfig;
    this.formModalConfirmation.show();
    this.itemOption = isStarted ? 1: 2;
    this.messageShow = isStarted ? 'Are you sure you want to start the SMPP Server?' : 'Are you sure you want to stop the SMPP Server?'
  }

  async getSmppServerConfig() {
    const response = await this.settingServices.getSmppServerConfig();

    if (response.status === 200) {
      this.smppServerConfig = response.data;
      this.smppServerConfig.sort((a, b) => b.id - a.id);
    }
    this.dtTrigger.next(this.dtOptions);
  }

  async onCloseConfirmationModal(band: boolean) {
    this.formModalConfirmation.hide();
    if (band) {
      await this.changeStatus();
    }
    this.renderer();
  }

  async changeStatus() {
    try {
      let menssage = '';
    
      switch (this.itemOption) {
        case 1:
          menssage = 'SMPP Server started successfully';
          this.itemSmppServer.enabled = 1;
          break;
        case 2:
          menssage = 'SMPP Server stopped successfully';
          this.itemSmppServer.enabled = 0;
          break;
        default:
          menssage = 'SMPP Server deleted successfully';
          break;
      }

      let resp;
      const parseSmppServer = await cleanObject(this.itemSmppServer, this.defaultObjet);
      if (this.itemOption === 3) {
        resp = await this.settingServices.deleteSmppServer(this.itemSmppServer.id)
      } else {
        resp = await this.settingServices.updateSmppServer(parseSmppServer.id, parseSmppServer);
      }
      
      if (resp.status == 200) {
        this.alertsvr.showAlert(1, menssage, resp.comment);
      } else {
        this.alertsvr.showAlert(2, resp.comment, 'Warning');
      }
    } catch (error) {
      this.alertsvr.showAlert(4, 'Server error', 'Error');
    }

    this.itemOption = 0;
    this.itemSmppServer;
    this.messageShow = '';
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

  showModal(e: boolean) {
    if (!e) { return; }
    this.formModalSmppServer.show();
  }

  onCloseModal(band: boolean) {
    if (band) {
      this.formModalSmppServer.hide();
    }
    this.renderer();
  }

  refresh() {
    this.renderer();
  }

  renderer() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.getSmppServerConfig();
    });
  }
}