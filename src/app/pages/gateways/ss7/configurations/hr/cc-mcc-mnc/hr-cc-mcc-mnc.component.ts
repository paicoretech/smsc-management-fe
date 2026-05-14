import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Subscription } from 'rxjs';
import { AlertService, DataTableConfigService, HomeRoutingCcMccMnc, HomeRoutingService, ResponseI } from '@app/core';

declare var window: any;

@Component({
  selector: 'app-hr-cc-mcc-mnc',
  templateUrl: './hr-cc-mcc-mnc.component.html',
})
export class HrCcMccMncComponent implements OnInit, OnDestroy {

  @ViewChild(DataTableDirective, { static: false }) dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  listRows: HomeRoutingCcMccMnc[] = [];
  modal!: any;
  modalDelete!: any;
  messageShow = '';
  rowSelected!: HomeRoutingCcMccMnc | null;

  networkId!: number;
  ss7HomeRoutingId!: number;
  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private hrService: HomeRoutingService,
    private alertsrv: AlertService,
    private dtConfigService: DataTableConfigService,
  ) {}

  ngOnInit(): void {
    this.loadDtOptions();
    this.modal = new window.bootstrap.Modal(document.getElementById('modalAddCcMccMnc'));
    this.modalDelete = new window.bootstrap.Modal(document.getElementById('modalDeleteCcMccMnc'));

    this.route.paramMap.subscribe(async params => {
      const idParam = params.get('network_id');
      this.networkId = idParam ? +idParam : 0;
      if (this.networkId) {
        const resp: ResponseI = await this.hrService.getHomeRoutingByNetwork(this.networkId);
        if (resp.status === 200 && resp.data) {
          this.ss7HomeRoutingId = resp.data.id;
          await this.loadData();
        } else {
          this.alertsrv.showAlert(2, 'Home Routing not found', 'Please create it in General tab first.');
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.subscriptions.unsubscribe();
  }

  loadDtOptions(): void {
    this.dtOptions = {
      ...this.dtConfigService.getConfig(),
      initComplete: () => {
        this.dtElement?.dtInstance?.then((dtInstance: DataTables.Api) => {
          dtInstance.on('length.dt', (_e: Event, _settings: any, len: number) => {
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

  async loadData(): Promise<void> {
    const response = await this.hrService.listCcMccMnc(this.ss7HomeRoutingId);
    if (response.status === 200) {
      this.listRows = response.data || [];
    }
    this.dtTrigger.next(this.dtOptions);
  }

  renderer(): void {
    this.dtElement.dtInstance.then((dt: DataTables.Api) => {
      dt.destroy();
      this.loadData();
    });
  }

  showModalCreate(): void {
    this.rowSelected = null;
    this.modal.show();
  }

  editData(row: HomeRoutingCcMccMnc): void {
    this.rowSelected = row;
    this.modal.show();
  }

  showDelete(row: HomeRoutingCcMccMnc): void {
    this.rowSelected = row;
    this.messageShow = 'Are you sure you want to delete this record?';
    this.modalDelete.show();
  }

  async onCloseModalDelete(confirm: boolean): Promise<void> {
    this.modalDelete.hide();
    if (!confirm || !this.rowSelected) return;

    try {
      const resp = await this.hrService.deleteCcMccMnc(this.rowSelected.id);
      if (resp.status === 200) {
        this.alertsrv.showAlert(1, 'Delete record', resp.comment);
      } else {
        this.alertsrv.showAlert(2, resp.message, resp.comment);
      }
    } catch {
      this.alertsrv.showAlert(3, 'Server error', 'Error deleting record.');
    }
    this.renderer();
  }

  onCloseModal(refresh: boolean): void {
    this.rowSelected = null;
    this.modal.hide();
    if (refresh) {
      this.renderer();
    }
  }
}