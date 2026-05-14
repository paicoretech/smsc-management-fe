import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ResponseI, Interpreter } from '@core/index';
import { InterpreterService, AlertService, DataTableConfigService } from '@core/index';

declare var window: any;

@Component({
  selector: 'app-interpreter',
  templateUrl: './interpreter.component.html'
})
export class InterpreterComponent implements OnInit {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  dataTable: any;
  response!: ResponseI;
  data: Interpreter[] = [];
  itemInterpreter!: Interpreter;
  messageShow!: string;
  public module: any;
  public formModal: any;

  constructor(
      private interpreterService: InterpreterService,
      private alertsvr: AlertService,
      private dtConfigService: DataTableConfigService,
    ) {}

  ngOnInit() {
    this.loadDtOptions();
    this.loadInterpreter();
    this.formModal = new window.bootstrap.Modal(document.getElementById('modalInterpreter'),)
  }

  async loadInterpreter() {
    this.response = await this.interpreterService.getInterpreter();
    if (this.response.status == 200) {
      this.data = this.response.data;
      this.data.sort((a, b) => b.id - a.id);
    }
    this.dtTrigger.next(this.dtOptions);
  }

  editData(interpreterEdit: any, disableControls?:boolean) {
    this.module = {
      title: 'Edit Item',
      isEdit: true,
      interpreterEdit: interpreterEdit,
      disableControls: disableControls
    }
    this.showModal(true);
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

  refresh() {
    this.renderer();
  }

 
  renderer() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadInterpreter();
    });
  }

  showModal(e: boolean) {
    if (!e) { return; }
    this.formModal.show();
  }

  onCloseModal(band: boolean) {
    if (band) {
      this.formModal.hide();
    }
    this.renderer();
  }

}