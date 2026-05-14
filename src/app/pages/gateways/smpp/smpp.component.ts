import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { GatewaySmpp, ResponseI } from '@core/index';
import { GatewaySmppService, HandleStatusService, AlertService, DataTableConfigService } from '@core/index';

declare var window: any;

@Component({
  selector: 'app-smpp',
  templateUrl: './smpp.component.html',
})
export class SmppComponent implements OnInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  dataTable: any;
  response!: ResponseI;
  gateways: GatewaySmpp[] = [];
  itemGateways!: GatewaySmpp;
  itemOption!: number;
  messageShow!: string;
  public formModalDelete: any;
  public run: boolean = false;
  private subscription!: Subscription;
  private countSessions: number = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private handleStatusService: HandleStatusService,
    private gatewaySmppService: GatewaySmppService,
    private dtConfigService: DataTableConfigService,
    private alertsvr: AlertService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscribeToStatusStream();
    this.loadDtOptions();
    this.loadGateways();
    this.formModalDelete = new window.bootstrap.Modal(document.getElementById('modalDeleteSmppGateway'));
  }

  private subscribeToStatusStream(): void {
    this.subscription = this.handleStatusService.startEventStream()
      .subscribe((data: string) => {
        const handlerStatus = data !== '' ? data.split(',') : null;

        if (!handlerStatus || handlerStatus[0] !== 'gw') {
          return;
        }

        const [, networkId, action, value] = handlerStatus;

        this.gateways.forEach((gateway) => {
          if (gateway.network_id !== parseInt(networkId)) {
            return;
          }

          if (action === 'status') {
            gateway.status =
              gateway.status === 'STARTED' && value === 'BINDING'
                ? gateway.status
                : value;

            if (gateway.status === 'STOPPED') {
              this.countSessions = 0;
              gateway.active_sessions_numbers = 0;
              gateway.enabled = 0;
            }
          }

          if (action === 'sessions') {
            const newValue = parseInt(value);

            if (!isNaN(newValue) && newValue >= 0) {
              this.countSessions =
                this.countSessions < gateway.sessions_number
                  ? this.countSessions + newValue
                  : this.countSessions;
            } else {
              this.countSessions =
                gateway.status === 'STOPPED'
                  ? 0
                  : Math.max(0, this.countSessions - 1);
            }

            gateway.active_sessions_numbers = this.countSessions;
          }
        });

        this.cdr.detectChanges();
      });
  }

  async loadGateways() {
    this.response = await this.gatewaySmppService.getGateways();
    if (this.response.status == 200) {
      this.gateways = this.response.data
        .filter((gateway: GatewaySmpp) => gateway.protocol === 'SMPP')
        .sort((a: any, b: any) => b.network_id - a.network_id);
    }
    this.dtTrigger.next(this.dtOptions);
  }

  goToCreate() {
    this.router.navigate(['/pages/gateways/smpp/add']);
  }

  editData(item: any, disableControls: boolean = false) {
    this.router.navigate(
      ['/pages/gateways/smpp/edit', item.network_id],
      {
        state: {
          gateway: item,
          disableControls: disableControls
        },
        queryParams: disableControls ? { readonly: 1 } : {}
      }
    );
  }

  async onCloseModalDelete(band: boolean) {
    this.formModalDelete.hide();

    if (!band) {
      return;
    }

    const shouldReloadTable = await this.changeStatus();

    if (shouldReloadTable) {
      this.renderer();
      return;
    }

    this.cdr.detectChanges();
  }

  async changeStatus(): Promise<boolean> {
    try {
      let menssage = '';
      const currentGateway = this.gateways.find(
        (gateway: GatewaySmpp) => gateway.network_id === this.itemGateways.network_id
      );

      switch (this.itemOption) {
        case 1:
          menssage = 'Initialized Gateway';
          this.itemGateways.enabled = 1;

          if (currentGateway) {
            currentGateway.enabled = 1;
            currentGateway.status = 'BINDING';
            currentGateway.active_sessions_numbers = 0;
          }
          break;

        case 2:
          menssage = 'Detained Gateway';
          this.itemGateways.enabled = 0;

          if (currentGateway) {
            currentGateway.enabled = 0;
            currentGateway.status = 'STOPPED';
            currentGateway.active_sessions_numbers = 0;
          }

          this.countSessions = 0;
          break;

        default:
          menssage = 'Delete Gateway';
          this.itemGateways.enabled = 2;
          break;
      }

      let resp = await this.gatewaySmppService.updateGateway(this.itemGateways);

      if (resp.status == 200) {
        this.alertsvr.showAlert(1, menssage, resp.comment);

        this.itemOption = 0;
        this.messageShow = '';

        if (this.itemGateways.enabled === 2) {
          return true;
        }

        return false;
      } else {
        this.alertsvr.showAlert(2, 'Could not change gateway status', 'Warning');
        return false;
      }
    } catch (error) {
      this.alertsvr.showAlert(3, 'Server error', 'Error');
      return false;
    }
  }

  async runGateway(serviceProviders: any) {
    this.itemGateways = serviceProviders;
    this.formModalDelete.show();
    this.itemOption = 1;
    this.messageShow = 'Are you sure you want to start the gateway?';
  }

  async stopGateway(gateway: any) {
    this.itemGateways = gateway;
    this.formModalDelete.show();
    this.itemOption = 2;
    this.messageShow = 'Are you sure you want to stop the gateway?';
  }

  async deleteGateway(gateway: any) {
    this.itemGateways = gateway;
    this.formModalDelete.show();
    this.itemOption = 3;
    this.messageShow = 'Are you sure you want to delete the gateway?';
  }

  renderer() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadGateways();
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.subscription.unsubscribe();
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
  }

  onPageLengthChange(newPageLength: number): void {
    this.dtConfigService.updateConfig({ pageLength: newPageLength });
    this.dtOptions.pageLength = newPageLength;
  }
}