import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertService, SettingServices, HttpServerConfig, DataTableConfigService, ResponseI } from '@app/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

declare var window: any;

@Component({
  selector: 'app-http',
  templateUrl: './http.component.html',
})
export class HttpComponent implements OnInit {

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  public httoServerConfig!: HttpServerConfig[];
  public state!: string;
  public application_name!: string;
  public messageShow!: string;
  public formModalSmppServer: any;
  response!: ResponseI;
  public opt: boolean = false;
  public btnAll: boolean = false;

  constructor(
    private settingServices: SettingServices,
    private alertsvr: AlertService,
    private dtConfigService: DataTableConfigService,
  ) { }

  ngOnInit(): void {
    this.loadDtOptions();
    this.formModalSmppServer = new window.bootstrap.Modal(document.getElementById('modalHttpServer'),);
    this.getHttpServerConfig();
  }

  async getHttpServerConfig() {
    this.response = await this.settingServices.getHttpServerConfig();
    this.btnAll = false;
    if (this.response.status == 200) {
      this.httoServerConfig = this.response.data;
    } else {
      this.btnAll = true;
      this.alertsvr.showAlert(3, 'Error', this.response.comment);
    }
    this.dtTrigger.next(this.dtOptions);
  }

  openModal(application_name: string, state: string) {
    this.state = state;
    this.application_name = application_name;
    this.formModalSmppServer.show();
    this.messageShow = state !== 'STARTED' ? 'Do you want to stop the http server name: ' + application_name + '?' : 'Do you want to start the http server name: ' + application_name + '?';
    this.opt = false;
  }

  openModalAll(state: string) {
    this.state = state;
    this.application_name = 'all';
    this.formModalSmppServer.show();
    this.messageShow = state !== 'STARTED' ? 'Do you want to stop all http servers?' : 'Do you want to start all http servers?';
    this.opt = true;
  }

  async changeStatus(band: boolean) {

    if (this.opt) {
      this.changeStatusAll(band);
      return
    }

    this.formModalSmppServer.hide();
    if (!band) return;

    try {
      let resp: ResponseI = await this.settingServices.updateStatusHttp(this.application_name, this.state);
      
      if (resp.status !== 200) {
        this.alertsvr.showAlert(3, 'Error', resp.comment);
        return;
      }
      
      this.renderer();
      this.alertsvr.showAlert(1, 'Success', this.state !== 'STARTED' ? 'The http server name ' + this.application_name + ' has been stopped' : 'The http server name ' + this.application_name + ' has been started');
    } catch (error) {
      this.alertsvr.showAlert(3, 'Server error', 'Error');
    }
  }

  async changeStatusAll(band: boolean) {
    this.formModalSmppServer.hide();
    if (!band) return;

    try {
      let resp: ResponseI = await this.settingServices.updateAllStatusHttp(this.state);

      if (resp.status !== 200) {
        this.alertsvr.showAlert(3, 'Error', resp.comment);
        return;
      }
      this.renderer();
      this.alertsvr.showAlert(1, 'Success', this.state !== 'STARTED' ? 'All http servers have been stopped' : 'All http servers have been started');
    } catch (error) {
      this.alertsvr.showAlert(3, 'Server error', 'Error');
    }
  }

  renderer() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.getHttpServerConfig();
    });
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
