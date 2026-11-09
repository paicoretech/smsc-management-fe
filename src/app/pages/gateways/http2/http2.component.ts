import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import {
  AlertService,
  DataTableConfigService,
  GatewayHttp2,
  HandleStatusService,
  Http2GatewaysService,
  ResponseI,
} from '@core/index';

declare var window: any;

@Component({
  selector: 'app-http2',
  templateUrl: './http2.component.html',
})
export class Http2Component implements OnInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  response!: ResponseI;
  gateways: GatewayHttp2[] = [];
  itemGateway!: GatewayHttp2;
  itemOption!: number;
  messageShow!: string;
  formModalAction: any;
  private subscription!: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private handleStatusService: HandleStatusService,
    private http2Service: Http2GatewaysService,
    private dtConfigService: DataTableConfigService,
    private alertsvr: AlertService,
    private router: Router
  ) { }

  ngOnInit() {
    this.subscribeToStatusStream();
    this.loadDtOptions();
    this.loadGateways();
    this.formModalAction = new window.bootstrap.Modal(
      document.getElementById('modalHttp2GatewayAction')
    );
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
              gateway.enabled = 0;
            }
          }
        });

        this.cdr.detectChanges();
      });
  }

  async loadGateways() {
    this.response = await this.http2Service.getHttp2Gateways();

    if (this.response.status === 200) {
      this.gateways = (this.response.data ?? [])
        .sort((a: GatewayHttp2, b: GatewayHttp2) => (b.network_id ?? 0) - (a.network_id ?? 0));
    } else {
      this.gateways = [];
      this.alertsvr.showAlert(2, this.response.message, this.response.comment);
    }

    this.dtTrigger.next(this.dtOptions);
  }

  goToCreate() {
    this.router.navigate(['/pages/gateways/http2/add']);
  }

  editData(item: GatewayHttp2, disableControls: boolean = false) {
    this.router.navigate(
      ['/pages/gateways/http2/edit', item.network_id],
      {
        state: {
          gateway: item,
          disableControls,
        },
        queryParams: disableControls ? { readonly: 1 } : {},
      }
    );
  }

  async onCloseModalAction(confirm: boolean) {
    (document.activeElement as HTMLElement)?.blur();
    this.formModalAction.hide();

    if (!confirm) {
      return;
    }

    const shouldReloadTable = await this.changeStatus();

    if (shouldReloadTable) {
      this.renderer();
      return;
    }

    this.cdr.detectChanges();
  }

  private async changeStatus(): Promise<boolean> {
    try {
      let message = '';
      const payload: GatewayHttp2 = { ...this.itemGateway };

      const currentGateway = this.gateways.find(
        (gw) => gw.network_id === this.itemGateway.network_id
      );

      switch (this.itemOption) {
        case 1:
          message = 'Initialized Gateway';
          payload.enabled = 1;
          if (currentGateway) {
            currentGateway.enabled = 1;
            currentGateway.status = 'STARTING';
          }
          break;

        case 2:
          message = 'Detained Gateway';
          payload.enabled = 0;
          if (currentGateway) {
            currentGateway.enabled = 0;
            currentGateway.status = 'STOPPED';
          }
          break;

        default:
          message = 'Deleted Gateway';
          payload.enabled = 2;
          break;
      }

      const resp = await this.http2Service.updateHttp2Gateway(
        Number(payload.network_id),
        payload
      );

      if (resp.status === 200) {
        this.alertsvr.showAlert(1, message, resp.comment);
        this.itemOption = 0;
        this.messageShow = '';
        return payload.enabled === 2;
      }

      this.alertsvr.showAlert(2, 'Could not change gateway status', resp.comment || 'Warning');
      return false;
    } catch (error) {
      this.alertsvr.showAlert(3, 'Server error', 'Error');
      return false;
    }
  }

  runGateway(gateway: GatewayHttp2) {
    this.itemGateway = gateway;
    this.formModalAction.show();
    this.itemOption = 1;
    this.messageShow = 'Are you sure you want to start the gateway?';
  }

  stopGateway(gateway: GatewayHttp2) {
    this.itemGateway = gateway;
    this.formModalAction.show();
    this.itemOption = 2;
    this.messageShow = 'Are you sure you want to stop the gateway?';
  }

  deleteGateway(gateway: GatewayHttp2) {
    this.itemGateway = gateway;
    this.formModalAction.show();
    this.itemOption = 3;
    this.messageShow = 'Are you sure you want to delete the gateway?';
  }

  refresh() {
    this.renderer();
  }

  renderer() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadGateways();
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.subscription?.unsubscribe();
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
