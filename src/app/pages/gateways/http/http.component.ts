import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { GatewaySmpp, ResponseI } from '@core/index';
import { GatewaySmppService, HandleStatusService, AlertService, DataTableConfigService } from '@core/index';

declare var window: any;

@Component({
  selector: 'app-http',
  templateUrl: './http.component.html',
})
export class HttpComponent implements OnInit, OnDestroy {
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

  constructor(
    private cdr: ChangeDetectorRef,
    private handleStatusService: HandleStatusService,
    private gatewaySmppService: GatewaySmppService,
    private dtConfigService: DataTableConfigService,
    private alertsvr: AlertService,
    private router: Router
  ) {
  }

  private subscribeToStatusStream(): void {
    this.subscription = this.handleStatusService.startEventStream()
      .subscribe((data: string) => {
        const handlerStatus = data !== '' ? data.split(',') : null;

        if (!handlerStatus || handlerStatus[0] !== 'gw') {
          return;
        }

        const [_, networkId, action, value] = handlerStatus;

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
              gateway.active_sessions_numbers = 0;
              gateway.enabled = 0;
            }
          }

          if (action === 'sessions') {
            const parsedValue = parseInt(value);
            gateway.active_sessions_numbers = !isNaN(parsedValue)
              ? parsedValue
              : gateway.active_sessions_numbers;
          }
        });

        this.cdr.detectChanges();
      });
  }

  ngOnInit() {
    this.subscribeToStatusStream();
    this.loadDtOptions();
    this.loadGateways();
    this.formModalDelete = new window.bootstrap.Modal(document.getElementById('modalDeleteHttpGateway'));
  }

  async loadGateways() {
    this.response = await this.gatewaySmppService.getGateways();

    if (this.response.status == 200) {
      this.gateways = this.response.data
        .filter((gateway: GatewaySmpp) => gateway.protocol === 'HTTP')
        .sort((a: any, b: any) => b.network_id - a.network_id);
    }

    this.dtTrigger.next(this.dtOptions);
  }

  goToCreate() {
    this.router.navigate(['/pages/gateways/http/add']);
  }

  editData(item: any, disableControls: boolean = false) {
    this.router.navigate(
      ['/pages/gateways/http/edit', item.network_id],
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
    (document.activeElement as HTMLElement)?.blur();

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
              currentGateway.status = 'STARTING'; // or 'BINDING' if backend uses that string for HTTP too
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
            break;

          default:
            menssage = 'Delete Gateway';
            this.itemGateways.enabled = 2;
            break;
        }

        const resp = await this.gatewaySmppService.updateGateway(this.itemGateways);

        if (resp.status == 200) {
          this.alertsvr.showAlert(1, menssage, resp.comment);

          this.itemOption = 0;
          this.messageShow = '';

          // Only reload DataTable when deleting
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