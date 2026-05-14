import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ErrorCodeMapping, ResponseI, ErrorCode, DeliveryErrorCode, Catalog } from '@core/index';
import { AlertService, ErrorCodeService, CatalogService, DeliveryErrorCodeService, ErrorCodeMappingService, DataTableConfigService } from '@core/index';

declare var window: any;

@Component({
  selector: 'app-error-code-mapping',
  templateUrl: './error-code-mapping.component.html',
})
export class ErrorCodeMappingComponent implements OnInit {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  dataTable: any;
  response!: ResponseI;
  data: ErrorCodeMapping[] = [];
  errorCodeList: ErrorCode[] = [];
  deliveryErrorCodeList: DeliveryErrorCode[] = [];
  deliveryStatusList: Catalog[] = [];
  itemResponseCodeMapping!: ErrorCodeMapping;
  itemOption!: number;
  messageShow!: string;
  public module: any;
  public formModal: any;
  public formModalDelete: any;
  public run: boolean = false;

  constructor(
    private alertsvr: AlertService,
    private errorCodeMappingService: ErrorCodeMappingService,
    private errorCodeService: ErrorCodeService,
    private catalogService: CatalogService,
    private deliveryErrorCodeService: DeliveryErrorCodeService,
    private dtConfigService: DataTableConfigService,
  ) { }

  ngOnInit() {
    this.loadDtOptions();
    this.loadResponseCodeMapping();
    this.loadErrorCode();
    this.loadDeliveryErrorCode();
    this.loadDeliveryStatus();
    this.formModal = new window.bootstrap.Modal(document.getElementById('modalErrorCodeMapping'),)
    this.formModalDelete = new window.bootstrap.Modal(document.getElementById('modalDeleteErrorCodeMapping'),)
  }


  async loadErrorCode() {
    this.response = await this.errorCodeService.getErrorCode();
    if (this.response.status == 200) {
      this.errorCodeList = this.response.data;
      this.data.sort((a, b) => b.id - a.id);
    }
  }

  async loadDeliveryErrorCode() {
    this.response = await this.deliveryErrorCodeService.getdeliveryErrorCode();
    if (this.response.status == 200) {
      this.deliveryErrorCodeList = this.response.data;
    }
  }

  async loadDeliveryStatus() {
    this.response = await this.catalogService.getByCatalogType('deliverystatus');
    if (this.response.status == 200) {
      this.deliveryStatusList = this.response.data;
    }
  }

  async loadResponseCodeMapping() {
    this.response = await this.errorCodeMappingService.getErrorCodeMapping();
    if (this.response.status == 200) {
      this.data = this.response.data;
    }
    this.dtTrigger.next(this.dtOptions);
  }

  showModal(e: boolean) {
    if (!e) { return; }
    this.formModal.show();
  }

  editData(responseCodeEdit: ErrorCodeMapping) {
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
      this.loadResponseCodeMapping();
      this.loadErrorCode();
      this.loadDeliveryErrorCode();
      this.loadDeliveryStatus();
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  refresh() {
    this.renderer();
  }

  async deleteResponseCode(responseCode: any) {
    this.itemResponseCodeMapping = responseCode;
    this.formModalDelete.show();
    this.messageShow = 'Are you sure you want to delete the Error Code Mapping?';
  }

  async delete() {
    try {
      let menssage = 'Delete Error Code Mapping';
      let resp = await this.errorCodeMappingService.deleteErrorCodeMapping(this.itemResponseCodeMapping.id);
      if (resp.status == 200) {
        this.alertsvr.showAlert(1, menssage, resp.comment);
      } else {
        this.alertsvr.showAlert(2, 'Could not delete the Error Code Mapping', resp.comment);
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
