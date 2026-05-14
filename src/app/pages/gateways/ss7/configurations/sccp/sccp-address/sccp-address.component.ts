import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertService, SccpAddress, SccpService, DataTableConfigService, GatewaySs7Service } from '@app/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

declare var window: any;

@Component({
  selector: 'app-sccp-address',
  templateUrl: './sccp-address.component.html',
})
export class SccpAddressComponent implements OnInit {

  sccpId: number = 0;
  networkId: number = 0;
  gateway: any = null;
  hasUnsavedChanges: boolean = false;
  isHotReloadInProgress: boolean = false;
  
  @Input() set dataSccpId(value: number) {
    this.sccpId = value;
  }
  @Input() set dataNetworkId(value: number) {
    this.networkId = value;
  }
  @Input() set dataGateway(value: any) {
    this.gateway = value;
  }

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dataTable: any;

  listAddresses: SccpAddress[] = [];

  modalAddresses!: any;
  modalDelete!: any;
  messageShow: string = '';

  address?: SccpAddress;
  isDeleting: boolean = false;

  constructor(
    private sccpService: SccpService,
    private alertSvr: AlertService,
    private dtConfigService: DataTableConfigService,
    private gatewaySs7Service: GatewaySs7Service
  ) { }

  ngOnInit(): void {
    this.loadDtOptions();
    this.modalAddresses = new window.bootstrap.Modal(document.getElementById('modalAddAddresses'),)
    this.modalDelete = new window.bootstrap.Modal(document.getElementById('modalDeleteAddresses'),)
    this.loadAddresses();
  }

  async loadAddresses() {
    let response = await this.sccpService.getAddresses(this.sccpId);
    if (response.status == 200) {
      this.listAddresses = response.data;
      this.dtTrigger.next(this.dtOptions);
    } else {
      this.alertSvr.error('Error loading addresses');
    }
  }

  showModal() {
    this.modalAddresses.show();
  }

  openModalEditView(item: SccpAddress) {
    this.address = item;
    this.showModal();
  }

  onCloseModal(band: boolean) {
    this.modalAddresses.hide();
    this.address = undefined;
    if (band) {
      this.hasUnsavedChanges = true;
    }
    this.renderer();
  }

  showConfirmationDelete(item: SccpAddress) {
    this.isDeleting = true;
    this.address = item;
    this.messageShow = 'Are you sure you want to delete this Address?';
    this.modalDelete.show();
  }

  async onCloseModalDelete(band: boolean) {
    this.modalDelete.hide();
    if (band && this.address?.id != null) {
      await this.deleteAddress(this.address.id);
      this.renderer();
      this.hasUnsavedChanges = true;
    }
    this.address = undefined;
  }

  async deleteAddress(id: number) {
    try {
      let resp = await this.sccpService.deleteAddress(id);
      if (resp.status == 200) {
        this.alertSvr.success('Address deleted successfully');
      } else {
        this.alertSvr.warning('Record could not be deleted', 'Warning');
      }
    } catch (error) {
      this.alertSvr.error('Server error', 'Error');
    }
  }

  renderer() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.clear();
      dtInstance.destroy();
      this.loadAddresses();
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

  isGatewayStarted(): boolean {
    return this.gateway && this.gateway.enabled === 1;
  }

  async triggerHotReload(): Promise<void> {
    if (!this.hasUnsavedChanges || this.isHotReloadInProgress) {
      return;
    }

    this.isHotReloadInProgress = true;
    try {
      const response = await this.gatewaySs7Service.triggerSccpHotReload('SCCP', 'ADDRESSES', this.networkId);
      
      if (response && response.status === 200) {
        this.alertSvr.success('SCCP Addresses hot reload triggered successfully');
        this.hasUnsavedChanges = false;
      } else {
        this.alertSvr.warning('Hot reload request completed with warnings');
      }
    } catch (error: any) {
      console.error('Hot reload error:', error);
      if (error?.error?.message) {
        this.alertSvr.error(`Hot reload failed: ${error.error.message}`);
      } else {
        this.alertSvr.error('Failed to trigger hot reload. Please check your connection.');
      }
    } finally {
      this.isHotReloadInProgress = false;
    }
  }

}
