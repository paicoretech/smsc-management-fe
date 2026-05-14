import { Component, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ResponseI, ErrorCode, Mno } from '@core/index';
import { AlertService, ErrorCodeService, MnosService, DataTableConfigService } from '@core/index';

declare var window: any;

@Component({
  selector: 'app-error-code',
  templateUrl: './error-code.component.html',
})
export class ErrorCodeComponent {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  dataTable: any;
  response!: ResponseI;
  data: ErrorCode[] = [];
  mnoList: Mno[] = [];
  itemResponseCode!: ErrorCode;
  itemOption!: number;
  messageShow!: string;
  public module: any;
  public formModal: any;
  public formModalDelete: any;
  public run: boolean = false;

  constructor(
    private alertsvr: AlertService,
    private errorCodeService: ErrorCodeService,
    private dtConfigService: DataTableConfigService,
    private mnoService: MnosService
  ) { }

  ngOnInit() {
    this.loadDtOptions();
    this.loadResponseCode();
    this.loadMnos();
    this.formModal = new window.bootstrap.Modal(document.getElementById('modalErrorCode'),)
    this.formModalDelete = new window.bootstrap.Modal(document.getElementById('modalDeleteErrorCode'),)
  }


  async loadMnos() {
    this.response = await this.mnoService.getMnos();
    if (this.response.status == 200) {
      this.mnoList = this.response.data;
      this.data.sort((a, b) => b.id - a.id);
    }
  }

  async loadResponseCode() {
    this.response = await this.errorCodeService.getErrorCode();
    if (this.response.status == 200) {
      this.data = this.response.data;
    }
    this.dtTrigger.next(this.dtOptions);
  }

  showModal(e: boolean) {
    if (!e) { return; }
    this.formModal.show();
  }

  editData(responseCodeEdit: ErrorCode) {
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
      this.loadResponseCode();
      this.loadMnos();
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  refresh() {
    this.renderer();
  }

  async deleteErrorCode(responseCode: any) {
    this.itemResponseCode = responseCode;
    this.formModalDelete.show();
    this.messageShow = 'Are you sure you want to delete the Error Code?';
  }

  async delete() {
    try {
      let menssage = 'Delete Error Code';
      let resp = await this.errorCodeService.deleteErrorCode(this.itemResponseCode.id);
      if (resp.status == 200) {
        this.alertsvr.showAlert(1, menssage, resp.comment);
      } else {
        this.alertsvr.showAlert(2, 'Could not delete error code', 'Warning');
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
