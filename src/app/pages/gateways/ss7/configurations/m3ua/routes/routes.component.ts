import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { AlertService, M3uaGeneralSettings, M3uaRoute, M3uaService, DataTableConfigService } from '@app/core';
import { M3uaSettingsService } from '@app/core/services/m3ua-settings.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Subscription } from 'rxjs';

declare var window: any;

@Component({
  selector: 'app-routes',
  templateUrl: './routes.component.html',
})
export class RoutesComponent implements OnInit,OnDestroy{

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dataTable: any;

  listRouting: M3uaRoute[] = [];
  modal!: any;
  modalDelete!: any;
  messageShow: string = '';
  route!: M3uaRoute;
  dataRoute: any;
  m3uaSettings?: M3uaGeneralSettings;
  module:any;
  private subscriptions = new Subscription();

  constructor(
    private m3uaService: M3uaService,
    private alertsrv: AlertService, 
    private m3uaSettingsService: M3uaSettingsService,
    private dtConfigService: DataTableConfigService,
  ) { }

  ngOnInit(): void {
    this.loadDtOptions();
    this.modal = new window.bootstrap.Modal(document.getElementById('modalAddRouting'),)
    this.modalDelete = new window.bootstrap.Modal(document.getElementById('modalDeleteRouting'),)
    this.subscriptions.add(this.m3uaSettingsService.data$.subscribe(settings => {
      if (settings) {
        this.m3uaSettings = settings;
      }
    }));
    this.loadData();

  }

  async loadData() {
    let response = await this.m3uaService.getRouteList(this.m3uaSettings!.id); // Assuming this method exists
    if (response.status === 200) {
      this.listRouting = response.data;
    }
    this.dtTrigger.next(this.dtOptions);
  }

  showModal(e: boolean) {
    if (!e) {
      return;
    }
    this.dataRoute = null;
    this.modal.show();
  }

  onCloseModal(band: boolean) {
    this.dataRoute = null;
    if (band) {
      this.modal.hide();
    }
    this.renderer();
  }

  async showDeleteRoute(route: any) {
    this.route = route;
    this.modalDelete.show();
    this.messageShow = 'Are you sure you want to delete the route?';
  }

  async onCloseModalDelete(band: boolean) {

    this.modalDelete.hide();
    if (band) {
      await this.deleteRoute();
    }
    this.renderer();
  }

  renderer() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadData();
    });
  }

  async deleteRoute() {
    try {
      let message = 'Delete Route';
      let resp = await this.m3uaService.deleteRoute(this.route.id); // Adapt this call to your actual service method
      if (resp.status === 200) {
        this.alertsrv.showAlert(1, message, resp.comment);
      } else {
        this.alertsrv.showAlert(2, 'Could not delete the application server', 'Warning');
      }
    } catch (error) {
      this.alertsrv.showAlert(3, 'Server error', 'Error');
    }
  }

  editData(routeData: any) {
    this.dataRoute = {
      dataRoute: routeData
    }
    this.modal.show();
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
