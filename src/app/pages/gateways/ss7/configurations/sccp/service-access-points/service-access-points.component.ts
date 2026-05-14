import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AlertService, SccpMtp3Destination, SccpLongMessageRule, SccpService, SccpServiceAccessPoint, DataTableConfigService, GatewaySs7Service } from '@app/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

declare var window: any;

@Component({
  selector: 'app-service-access-points',
  templateUrl: './service-access-points.component.html',
})
export class ServiceAccessPointsComponent implements OnInit {

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

  @ViewChildren(DataTableDirective)
  dtElements!: QueryList<DataTableDirective>;
  dtOptions: DataTables.Settings = {};
  dtTriggerSap: Subject<any> = new Subject<any>();
  dtTriggerMtp3: Subject<any> = new Subject<any>();
  dtTriggerLongMessage: Subject<any> = new Subject<any>();

  listSAP: SccpServiceAccessPoint[] = [];
  listMtp3: SccpMtp3Destination[] = [];
  listLongMessage: SccpLongMessageRule[] = [];

  modalServiceAccess!: any;
  modalMtp3Destination!: any;
  modalLongMessageRule!: any;
  modalDelete!: any;
  messageShow: string = '';

  serviceAccess?: SccpServiceAccessPoint;
  mtp3Destination?: SccpMtp3Destination;
  longMessageRule?: SccpLongMessageRule;

  isDeletingSAP: boolean = false;
  isDeletingMtp3: boolean = false;
  isDeletingLongMessage: boolean = false;


  constructor(
    private sccpService: SccpService,
    private alertSvr: AlertService,
    private dtConfigService: DataTableConfigService,
    private gatewaySs7Service: GatewaySs7Service
  ) { }

  ngOnInit(): void {
    this.loadDtOptions();
    this.modalServiceAccess = new window.bootstrap.Modal(document.getElementById('modalServiceAccess'),)
    this.modalMtp3Destination = new window.bootstrap.Modal(document.getElementById('modalMtp3Destination'),)
    this.modalLongMessageRule = new window.bootstrap.Modal(document.getElementById('modalLongMessageRule'),)
    this.modalDelete = new window.bootstrap.Modal(document.getElementById('modalDelete'),)
    this.loadServicesAccess();
    this.loadMtp3Destinations();
    this.loadLongMessageRules();
  }

  async loadServicesAccess() {
    let response = await this.sccpService.getServiceAccessPoint(this.sccpId);
    if (response.status == 200) {
      this.listSAP = response.data;
      this.dtTriggerSap.next(this.dtOptions);
    } else {
      this.alertSvr.error('Error loading service access points');
    }
  }

  async loadMtp3Destinations() {
    let response = await this.sccpService.getMtp3Destination(this.sccpId);
    if (response.status == 200) {
      this.listMtp3 = response.data;
      this.dtTriggerMtp3.next(this.dtOptions);
    } else {
      this.alertSvr.error('Error loading MTP3 destinations');
    }
  }

  async loadLongMessageRules() {
    let response = await this.sccpService.getLongMessageRules(this.sccpId);
    if (response.status == 200) {
      this.listLongMessage = response.data;
      this.dtTriggerLongMessage.next(this.dtOptions);
    } else {
      this.alertSvr.error('Error loading Long Message Rules');
    }
  }

  showModal(modal: number) {
    if (modal == 1) {
      this.modalServiceAccess.show();
    } else if (modal == 2) {
      this.modalMtp3Destination.show();
    } else if (modal == 3) {
      this.modalLongMessageRule.show();
    }
  }

  openModalEditSAP(item: SccpServiceAccessPoint) {
    this.serviceAccess = item;
    this.modalServiceAccess.show();
  }

  openModalEditMtp3(item: SccpMtp3Destination) {
    this.mtp3Destination = item;
    this.modalMtp3Destination.show();
  }

  openModalEditLongMessageRule(item: SccpLongMessageRule) {
    this.longMessageRule = item;
    this.modalLongMessageRule.show();
  }

  onCloseModal(band: boolean, modal: number) {
    if (modal == 1) {
      this.modalServiceAccess.hide();
      if (band) {
        this.rerender();
        this.hasUnsavedChanges = true;
      }
    }
    else if (modal == 2) {
      this.modalMtp3Destination.hide();
      if (band) {
        this.rerender();
        this.hasUnsavedChanges = true;
      }
    }
    else if (modal == 3) {
      this.modalLongMessageRule.hide();
      if (band) {
        this.rerender();
        this.hasUnsavedChanges = true;
      }
    }
    this.serviceAccess = undefined;
    this.mtp3Destination = undefined;
    this.longMessageRule = undefined;
  }

  showConfirmationDeleteSAP(item: SccpServiceAccessPoint) {
    this.isDeletingSAP = true;
    this.serviceAccess = item;
    this.messageShow = 'Are you sure you want to delete this SAP?';
    this.modalDelete.show();
  }

  showConfirmationDeleteMtp3(item: SccpMtp3Destination) {
    this.isDeletingMtp3 = true;
    this.mtp3Destination = item;
    this.messageShow = 'Are you sure you want to delete this Mtp3?';
    this.modalDelete.show();
  }

  showConfirmationDeleteLongMessageRule(item: SccpLongMessageRule) {
    this.isDeletingLongMessage = true;
    this.longMessageRule = item;
    this.messageShow = 'Are you sure you want to delete this Long Message Rule?';
    this.modalDelete.show();
  }

  async onCloseModalDelete(band: boolean) {
    this.modalDelete.hide();

    if (band) {
      if (this.isDeletingSAP && this.serviceAccess?.id != null) {
        await this.deleteSAP(this.serviceAccess.id);
      }
      else if (this.isDeletingMtp3 && this.mtp3Destination?.id != null) {
        await this.deleteMtp3(this.mtp3Destination.id);
      }
      else if (this.isDeletingLongMessage && this.longMessageRule?.id != null) {
        await this.deleteLongMessageRule(this.longMessageRule.id);
      }
      this.rerender();
      this.hasUnsavedChanges = true;
    }
    this.serviceAccess = undefined;
    this.mtp3Destination = undefined;
    this.longMessageRule = undefined;
    this.isDeletingSAP = false;
    this.isDeletingMtp3 = false;
    this.isDeletingLongMessage = false;
  }

  async deleteSAP(id: number) {
    try {
      let resp = await this.sccpService.deleteServiceAccessPoint(id);
      if (resp.status == 200) {
        this.alertSvr.success('SAP deleted successfully');
      } else {
        this.alertSvr.warning('Record could not be deleted', 'Warning');
      }
    } catch (error) {
      this.alertSvr.error('Server error', 'Error');
    }
  }

  async deleteMtp3(id: number) {
    try {
      let resp = await this.sccpService.deleteMtp3Destination(id);
      if (resp.status == 200) {
        this.alertSvr.success('Mtp3 deleted successfully');
      } else {
        this.alertSvr.warning('Record could not be deleted', 'Warning');
      }
    } catch (error) {
      this.alertSvr.error('Server error', 'Error');
    }
  }

  async deleteLongMessageRule(id: number) {
    try {
      let resp = await this.sccpService.deleteLongMessageRule(id);
      if (resp.status == 200) {
        this.alertSvr.success('Long Message Rule deleted successfully');
      } else {
        this.alertSvr.warning('Record could not be deleted', 'Warning');
      }
    } catch (error) {
      this.alertSvr.error('Server error', 'Error');
    }
  }

  async rerender() {
    this.dtElements.forEach((dtElement: DataTableDirective) => {
      if(dtElement.dtInstance)
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
      });
    });
    this.loadServicesAccess();
    this.loadMtp3Destinations();
    this.loadLongMessageRules();
  }

  loadDtOptions() {
    this.dtOptions = {
      ...this.dtConfigService.getConfig(),
      initComplete: () => {
        this.dtElements.forEach((dtElement: DataTableDirective) => {
          if(dtElement.dtInstance) {
            dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
              dtInstance.on('length.dt', (e: Event, settings: any, len: number) => {
                this.onPageLengthChange(len);
              });
            });
          }
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
      const response = await this.gatewaySs7Service.triggerSccpHotReload('SCCP', 'SERVICE_ACCESS_POINTS', this.networkId);
      
      if (response && response.status === 200) {
        this.alertSvr.success('SCCP Service Access Points hot reload triggered successfully');
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
