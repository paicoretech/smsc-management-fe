import { Component, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ResponseI } from '@core/index';
import { AlertService, DeliveryErrorCode, DeliveryErrorCodeService, DataTableConfigService } from '@core/index';

declare var window: any;
@Component({
  selector: 'app-response-code',
  templateUrl: './delivery-error-code.component.html',
})
export class DeliveryErrorCodeComponent {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  dataTable: any;
  response!: ResponseI;
  data: DeliveryErrorCode[] = [];
  itemServerErrorCode!: DeliveryErrorCode;
  itemOption!: number;
  messageShow!: string;
  public module: any;
  public formModal: any;
  public formModalDelete: any;
  public run: boolean = false;

  constructor(
    private alertsvr: AlertService,
    private deliveryErrorCodeService: DeliveryErrorCodeService,
    private dtConfigService: DataTableConfigService,
  ) { }

  ngOnInit() {
    this.loadDtOptions();
    this.loadServerErrorCode();
    this.formModal = new window.bootstrap.Modal(document.getElementById('modalDeliveryErrorCode'),)
    this.formModalDelete = new window.bootstrap.Modal(document.getElementById('modalDeleteDeliveryErrorCode'),)
  }

  async loadServerErrorCode() {
    this.response = await this.deliveryErrorCodeService.getdeliveryErrorCode();
    if (this.response.status == 200) {
      this.data = this.response.data;
      this.data.sort((a, b) => b.id - a.id);
    }
    this.dtTrigger.next(this.dtOptions);
  }

  showModal(e: boolean) {
    if (!e) { return; }
    this.formModal.show();
  }

  editData(responseCodeEdit: DeliveryErrorCode) {
    this.module = {
      title: 'Edit Item',
      isEdit: true,
      responseCodeEdit: responseCodeEdit
    }
    this.showModal(true);
  }

  onCloseModal(band: boolean) {
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

  async deleteResponseCode(responseCode: any) {
    this.itemServerErrorCode = responseCode;
    this.formModalDelete.show();
    this.messageShow = 'Are you sure you want to delete the Delivery Error Code?';
  }

  async delete() {
    try {
      let menssage = 'Delete Delivery Error Code';
      let resp = await this.deliveryErrorCodeService.deletedeliveryErrorCode(this.itemServerErrorCode.id);
      if (resp.status == 200) {
        this.alertsvr.showAlert(1, menssage, resp.comment);
      } else {
        this.alertsvr.showAlert(2, 'Could not delete the Delivery Error Code', resp.comment);
      }
    } catch (error) {
      this.alertsvr.showAlert(3, 'Server error', 'Error');
    }
    this.messageShow = '';
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
