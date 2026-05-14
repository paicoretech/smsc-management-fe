import { Component, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ResponseI, RoutingRules, Catalog, Network } from '@core/index';

import { AlertService, RoutingRolesService, CatalogService, DataTableConfigService } from '@core/index';

declare var window: any;

@Component({
  selector: 'app-rules-service-providers',
  templateUrl: './rules-service-providers.component.html',
})
export class RulesServiceProvidersComponent {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  dataTable: any;
  response!: ResponseI;
  data: RoutingRules[] = [];
  networksList: Network[] = [];
  networksListSs7: Network[] = [];
  newSourceAddressTonList: Catalog[] = [];
  newSourceAddressNpiList: Catalog[] = [];
  newDestAddrTonList: Catalog[] = [];
  newDestAddrNpiList: Catalog[] = [];
  itemRoutingRules!: RoutingRules;
  itemOption!: number;
  messageShow!: string;
  public module: any;
  public formModal: any;
  public formModalDelete: any;
  public run: boolean = false;

  constructor(
    private alertsvr: AlertService,
    private routingRolesService: RoutingRolesService,
    private catalogService: CatalogService,
    private dtConfigService: DataTableConfigService,
  ) {}

  ngOnInit() {
    this.loadDtOptions();
    this.loadServerErrorCode();
    this.loadNetworks();
    this.loadSourceNewAddressTon();
    this.loadSourceNewAddressNpi();
    this.loadNewDestAddrTon();
    this.loadNewDestAddrNpi();
    this.formModal = new window.bootstrap.Modal(document.getElementById('modalRoutingRoles'),)
    this.formModalDelete = new window.bootstrap.Modal(document.getElementById('modalDeleteRoutingRoles'),)
  }

  async loadServerErrorCode() {
    this.response = await this.routingRolesService.getRoutingRoles();
    if (this.response.status == 200) {
      this.data = this.response.data;
      this.data.sort((a, b) => b.id - a.id);
    }
    this.dtTrigger.next(this.dtOptions);
  }

  async loadNetworks() {
    this.response = await this.routingRolesService.getNetworks();
    if (this.response.status == 200) {
      this.networksList = this.response.data;
      this.networksListSs7 = this.networksList.filter((network) => network.protocol === 'SS7');
    }
  }

  async loadSourceNewAddressTon() {
    this.response = await this.catalogService.getByCatalogType('toncatalogrules');
    if (this.response.status == 200) {
      this.newSourceAddressTonList = this.response.data;
    }
  }

  async loadSourceNewAddressNpi() {
    this.response = await this.catalogService.getByCatalogType('npicatalogrules');
    if (this.response.status == 200) {
      this.newSourceAddressNpiList = this.response.data;
    }
  }

  async loadNewDestAddrTon() {
    this.response = await this.catalogService.getByCatalogType('toncatalogrules');
    if (this.response.status == 200) {
      this.newDestAddrTonList = this.response.data;
    }
  }

  async loadNewDestAddrNpi() {
    this.response = await this.catalogService.getByCatalogType('npicatalogrules');
    if (this.response.status == 200) {
      this.newDestAddrNpiList = this.response.data;
    }
  }

  showModal(e: boolean) {
    if (!e) { return; }
    this.formModal.show();
  }

  editData(responseCodeEdit: RoutingRules) {
    this.module = {
      title: 'Edit Item',
      isEdit: true,
      responseCodeEdit: responseCodeEdit
    }
    this.showModal(true);
  }

  onCloseModal(band: boolean) {
    this.module = {
      title: '',
    }
    if (band) {
      this.formModal.hide();
    }
    this.renderer();
  }

  async onCloseModalDelete(band: boolean) {
    this.formModalDelete.hide();
    if (band) {
      await this.delete();
    }
    this.renderer();
  }

  renderer() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadServerErrorCode();
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  refresh() {
    this.renderer();
  }

  async deleteItem(item: any) {
    this.itemRoutingRules = item;
    this.formModalDelete.show();
    this.messageShow = 'Are you sure you want to delete the Rules and Routing?';
  }

  async delete() {
    try {
      let menssage = 'Delete Routing Roles';
      let resp = await this.routingRolesService.deleteRoutingRolesg(this.itemRoutingRules.id);
      if (resp.status == 200) {
        this.alertsvr.showAlert(1, menssage, resp.comment);
      } else {
        this.alertsvr.showAlert(2, 'Could not delete the Rules and Routing', resp.comment);
      }
    } catch (error) {
      this.alertsvr.showAlert(3, 'Server error', 'Error');
    }

    this.messageShow = '';
  }

  getInfo(rule: RoutingRules): string {
    let is_sri_response = '';
    let origin = this.networksList.find((network) => network.network_id === rule.origin_network_id);
    let destination = rule.destination.map((dest) => {
        let network = this.networksList.find((network) => network.network_id === dest.network_id);
        return (network?.type?.toUpperCase() || '') + ' ' + (network?.protocol || '');
    });
    if (origin?.protocol === 'SS7') {
      is_sri_response = rule.is_sri_response ? '(Evaluate the SRI response)' : '(MO)';
    }
    if ( origin?.protocol === 'DIAMETER') {
      is_sri_response = '(MO)';
    }
    return `${origin?.type?.toUpperCase() || ''} ${origin?.protocol || ''} ${is_sri_response} -> ${destination.join(', ')}`;
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
