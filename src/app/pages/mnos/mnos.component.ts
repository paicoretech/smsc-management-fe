import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ResponseI, Mno } from '@core/index';
import { MnosService, AlertService, DataTableConfigService } from '@core/index';

declare var window: any;

@Component({
  selector: 'app-mnos',
  templateUrl: './mnos.component.html'
})
export class MnosComponent implements OnInit {

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  dataTable: any;
  response!: ResponseI;
  data: Mno[] = [];
  itemMno!: Mno;
  itemOption!: number;
  messageShow!: string;
  public module: any;
  public formModal: any;
  public formModalDelete: any;
  public run: boolean = false;

  constructor(
    private mnoService: MnosService,
    private alertsvr: AlertService,
    private dtConfigService: DataTableConfigService,
  ) {}

  ngOnInit() {
    this.loadDtOptions();
    this.loadMnos();
    this.formModal = new window.bootstrap.Modal(document.getElementById('modalMno'),)
    this.formModalDelete = new window.bootstrap.Modal(document.getElementById('modalDeleteMno'),)
  }

  async loadMnos() {
    this.response = await this.mnoService.getMnos();
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

  editData(mnoEdit: any) {
    this.module = {
      title: 'Edit Item',
      isEdit: true,
      mnoEdit: mnoEdit
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
      this.loadMnos();
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  refresh() {
    this.renderer();
  }

  async deleteMno(mno: any) {
    this.itemMno = mno;
    this.formModalDelete.show();
    this.messageShow = 'Are you sure you want to delete the MNOs?';
  }

  async delete() {
    try {
      let menssage = 'Delete MNOs';
      let resp = await this.mnoService.deleteMnos(this.itemMno.id);
      if (resp.status == 200) {
        this.alertsvr.showAlert(1, menssage, resp.comment);
      } else {
        this.alertsvr.showAlert(2, 'Could not delete MNOs', 'Warning');
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