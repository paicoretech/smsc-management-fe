import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AlertService,
  ChargingSetting,
  ChargingSettingsService,
  DataTableConfigService,
  ResponseI,
} from '@app/core';
import { ApiContext } from '@app/core/utils/types/api-context.type';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

declare var window: any;
type ConfirmAction = 'deleteGateway' | 'toggleGateway';

@Component({
  selector: 'app-diameter-gateway',
  templateUrl: './diameter-gateway.component.html',
})
export class DiameterGatewayComponent implements OnInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  dataTable: any;
  response!: ResponseI;
  chargingList: ChargingSetting[] = [];
  currentAction: ConfirmAction | null = null;
  currentItem: ChargingSetting | null = null;
  messageShow!: string;
  module: any;
  formModalDelete: any;
  itemOption!: number;
  ctx: ApiContext = ApiContext.SMSC;

  constructor(
    private chargingSettingService: ChargingSettingsService,
    private dtConfigService: DataTableConfigService,
    private alertSvc: AlertService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadDtOptions();
    this.ctx = (this.route.snapshot.data['apiContext'] as ApiContext) || ApiContext.SMSC;
    console.log('API Context Diameter:', this.ctx);
    this.loadChargingSettings();
    this.formModalDelete = new window.bootstrap.Modal(
      document.getElementById('modalDeleteDiameterGateway')
    );
  }

  async loadChargingSettings() {
    this.response = await this.chargingSettingService.getAllDiameterGateways(this.ctx);
    if (this.response.status == 200) {
      this.chargingList = this.response.data;
    }
    this.dtTrigger.next(this.dtOptions);
  }

  openConfirm(action: ConfirmAction, item: ChargingSetting): void {
    this.currentAction = action;
    this.currentItem = item;

    this.messageShow =
      action === 'deleteGateway'
        ? 'Are you sure you want to delete the Diameter Gateway?'
        : `Are you sure you want to ${item.started ? 'stop' : 'start'} the Diameter Gateway?`;

    this.formModalDelete?.show();
  }

  async onCloseModalDelete(confirm: boolean) {
    this.formModalDelete.hide();

    if (!confirm || !this.currentAction || !this.currentItem) {
      this.resetConfirmState();
      return;
    }

    const id = this.currentItem?.id;

    if (id == null || id <= 0) {
      this.alertSvc.showAlert(4, 'Error', 'Invalid gateway id.');
      return;
    }

    try {
      switch (this.currentAction) {
        case 'deleteGateway':
          await this.removeDiameterGatewayById(id);
          break;
        case 'toggleGateway':
          await this.toggleDiameterGatewayByItem(this.currentItem);
          break;
      }
    } finally {
      this.resetConfirmState();
    }
  }

  private resetConfirmState() {
    this.currentAction = null;
    this.currentItem = null;
  }


  private async removeDiameterGatewayById(id?: number): Promise<void> {
    if (id == null || id <= 0) {
      this.alertSvc.showAlert(4, 'Error', 'Invalid gateway id.');
      return;
    }

    const resp = await this.chargingSettingService.removeDiameterGateway(id);

    if (resp.status === 200 || resp.status === 404) {
      this.alertSvc.showAlert(1, 'Success', resp.comment || 'Record deleted successfully.');
      this.chargingList = [];
      this.renderer();
    } else {
      this.alertSvc.showAlert(2, 'Warning', resp.comment || 'Could not delete record.');
    }
  }

  private async toggleDiameterGatewayByItem(item: ChargingSetting): Promise<void> {
    if (!item?.id) return;

    const newStatus = !item.started;
    const response = await this.chargingSettingService.toggleDiameterGateway(item.id, newStatus);

    if (response.status === 200) {
      this.alertSvc.showAlert(
        1,
        'Success',
        `Diameter Gateway ${newStatus ? 'Started' : 'Stopped'} Successfully.`
      );
      this.renderer();
    } else {
      this.alertSvc.showAlert(4, 'Error', 'Error updating Diameter Gateway status.');
    }
  }

  renderer() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadChargingSettings();
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
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
      },
    };
  }

  onPageLengthChange(newPageLength: number): void {
    this.dtConfigService.updateConfig({ pageLength: newPageLength });
    this.dtOptions.pageLength = newPageLength;
  }
}
