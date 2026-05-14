import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import {
  ResponseI,
  DndEntry,
  DndService,
  DateTimeUtil,
  RoutingRolesService,
} from '@core/index';
import { AlertService, DataTableConfigService } from '@core/index';
declare var window: any;

@Component({
  selector: 'app-dnd',
  templateUrl: './dnd.component.html',
})
export class DndComponent implements OnInit, OnDestroy {
    detailViewOnly: boolean = false;
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  dataTable: any;
  response!: ResponseI;
  data: DndEntry[] = [];
  networksList: any[] = [];
  itemDnd!: DndEntry;
  itemOption!: number;
  messageShow!: string;
  showDetail: boolean = false;

  public formModal: any;
  public formModalDisabled: any;
  public formModalDetail: any;
  public run: boolean = false;
  public deleteAction: 'disable' | 'enable' | 'delete' = 'disable';

  constructor(
    private alertsvr: AlertService,
    private dtConfigService: DataTableConfigService,
    private routingRolesService: RoutingRolesService,
    private dndService: DndService
  ) {}

  ngOnInit() {
    this.loadDtOptions();
    this.loadDnd();
    this.loadNetworks();
    this.formModal = new window.bootstrap.Modal(
      document.getElementById('modalDnd')
    );
    this.formModalDisabled = new window.bootstrap.Modal(
      document.getElementById('modalDisableDnd')
    );
    this.formModalDetail = new window.bootstrap.Modal(
      document.getElementById('modalDndDetail')
    );
  }

  async loadDnd() {
    this.response = await this.dndService.getDndList();
    if (this.response.status == 200) {
      this.data = this.response.data;
    }
    this.dtTrigger.next(this.dtOptions);
  }

  async loadNetworks(): Promise<void> {
    const response: ResponseI = await this.routingRolesService.getNetworks();
    if (response.status === 200) {
      const allNetworks = response.data || [];
      this.networksList = allNetworks;
    }
  }

  getDate(date: string | null): string {
    if (!date) return '';
    return DateTimeUtil.toUtcFromLocal(date) ?? '';
  }

  showModal(e: boolean) {
    if (!e) {
      return;
    }
    this.formModal.show();
  }

  showModalDetail(dndEdit: DndEntry , viewOnly: boolean = true) {
    this.showDetail = true;
      this.detailViewOnly = viewOnly;
    this.itemDnd = dndEdit;
    this.formModalDetail.show();
  }

  onCloseModal(shouldClose: boolean, modalRef: number): void {
    if (!shouldClose) {
      this.renderer();
      return;
    }

    switch (modalRef) {
      case 1:
        this.formModal.hide();
        break;
      case 2:
        this.showDetail = false;
        this.formModalDetail.hide();
        break;
    }

    this.renderer();
  }

  confirmDisableDnd(dndEntry: DndEntry) {
    this.itemDnd = dndEntry;
    this.deleteAction = 'disable';
    this.messageShow = 'Are you sure you want to disable this DND entry?';
    this.formModalDisabled.show();
  }

  confirmEnableDnd(dndEntry: DndEntry) {
    this.itemDnd = dndEntry;
    this.deleteAction = 'enable';
    this.messageShow = 'Are you sure you want to enable this DND entry?';
    this.formModalDisabled.show();
  }

  confirmDeleteDnd(dndEntry: DndEntry) {
    this.itemDnd = dndEntry;
    this.deleteAction = 'delete';
    this.messageShow = 'Are you sure you want to delete this DND entry?';
    this.formModalDisabled.show();
  }

  async handleDnd(
    action: 'disable' | 'enable' | 'delete'
  ): Promise<ResponseI | null> {
    const actionMap = {
      disable: {
        fn: () => this.dndService.changeDndStatus(this.itemDnd.id, false),
        past: 'disabled',
      },
      enable: {
        fn: () => this.dndService.changeDndStatus(this.itemDnd.id, true),
        past: 'enabled',
      },
      delete: {
        fn: () => this.dndService.deleteDndList(this.itemDnd.id),
        past: 'deleted',
      },
    };
    try {
      const { fn, past } = actionMap[action];
      const resp = await fn();
      if (resp.status === 200) {
        this.alertsvr.showAlert(
          1,
          resp.message || `DND ${past} successfully`,
          ''
        );
      } else {
        this.alertsvr.showAlert(
          2,
          resp.message || `Could not ${action} DND`,
          'Warning'
        );
      }
      return resp;
    } catch {
      this.alertsvr.showAlert(3, 'Server error occurred.', 'Error');
      return null;
    }
  }

  async onCloseModalDelete(confirmed: boolean) {
    this.formModalDisabled.hide();

    if (!confirmed || this.run) {
      this.messageShow = '';
      return;
    }
    this.run = true;
    try {
      const action = this.deleteAction as 'disable' | 'enable' | 'delete';
      const resp: ResponseI | null = await this.handleDnd(action);
      if (resp && resp.status === 200) {
        this.renderer();
      }
    } finally {
      this.run = false;
      this.messageShow = '';
    }
  }

  renderer() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadDnd();
    });
  }

  loadDtOptions() {
      this.dtOptions = {
         ...this.dtConfigService.getConfig(),
         initComplete: () => {
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          this.enableTooltips()
          dtInstance.on('draw.dt', () => this.enableTooltips());
          dtInstance.on('length.dt', (e: Event, settings: any, len: number) => {
          this.onPageLengthChange(len);
             });
           });
          },
        };
  }
  private enableTooltips(): void {
     const bootstrap = (window as any).bootstrap?.Tooltip;
     if (!bootstrap) return;
     document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(element => {
         bootstrap.getInstance(element)?.dispose();
         new bootstrap(element as HTMLElement, {
             container: 'body',
             animation: false,
             delay: { show: 0, hide: 0 },
             trigger: 'hover',
             placement: 'top',
         });
    });
  }

  onPageLengthChange(newPageLength: number): void {
    this.dtConfigService.updateConfig({ pageLength: newPageLength });
    this.dtOptions.pageLength = newPageLength;
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
