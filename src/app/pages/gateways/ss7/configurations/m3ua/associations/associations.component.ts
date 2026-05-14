import { Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AlertService, M3uaAssociation, M3uaAssociationSocket, M3uaGeneralSettings, DataTableConfigService, ResponseI } from '@app/core';
import { M3uaService } from '@app/core';
import { M3uaSettingsService } from '@app/core/services/m3ua-settings.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Subscription } from 'rxjs';

declare var window: any;

@Component({
  selector: 'app-associations',
  templateUrl: './associations.component.html',
})
export class AssociationsComponent implements OnInit, OnDestroy {

  dtTriggerSocket: Subject<any> = new Subject<any>();
  dtTriggerAssociations: Subject<any> = new Subject<any>();

  @ViewChildren(DataTableDirective)
  dtElements!: QueryList<DataTableDirective>;
  dtOptions: DataTables.Settings = {};

  listSockets: M3uaAssociationSocket[] = [];
  listAssociations: M3uaAssociation[] = [];
  modalSocket!: any;
  modalAssociation!: any;
  modalDelete!: any;
  messageShow: string = '';
  dataSocket!: any;
  socket!: M3uaAssociationSocket;
  dataAssociation!: any;
  association!: M3uaAssociation;
  response!: ResponseI;
  currentDeleteModal:number=0;
  MODAL_SOCKET : number = 1;
  MODAL_ASSOCIATION : number = 2;
  m3uaSettings: M3uaGeneralSettings | null = null;
  itemOption!:number;
  private subscriptions = new Subscription();

  constructor(
    private m3uaService: M3uaService,
    private alertsvr: AlertService,
    private m3uaSettingsService: M3uaSettingsService,
    private dtConfigService: DataTableConfigService,
  ) {}

  ngOnInit(): void {
    this.loadDtOptions();
    this.modalSocket = new window.bootstrap.Modal(document.getElementById('modalAddSocket'),)
    this.modalAssociation = new window.bootstrap.Modal(document.getElementById('modalAddAssociation'),)
    this.modalDelete = new window.bootstrap.Modal(document.getElementById('modalDeleteAssociation'),)
    this.subscriptions.add(this.m3uaSettingsService.data$.subscribe(settings => {
      if (settings) {
        this.m3uaSettings = settings;
      }
    }));
    this.loadSockets();
    this.loadAssociations();
  }

  async loadSockets() {
    try {
       this.response = await this.m3uaService.getSocketsList(this.m3uaSettings!.id);

      if (this.response.status === 200) {
        this.listSockets = this.response.data;
      } else {

        this.alertsvr.showAlert(4, this.response.message, this.response.comment);
      }
    } catch (error) {
      console.error('Error al cargar sockets:', error);
      this.alertsvr.showAlert(4, "Error", "No se pudo cargar la lista de sockets.");
    }
    this.dtTriggerSocket.next(this.dtOptions);
  }

  editSocket(m3uaSocket: any) {
    this.socket = m3uaSocket;
    this.dataSocket = {
      dataSocket: this.socket,
    };
    this.modalSocket.show();
  }

  editAssoc(M3uaAssociation: any) {
    this.association = M3uaAssociation;
    this.dataAssociation = {
      dataAssociation: this.association,
    };
    this.modalAssociation.show();
  }

  async loadAssociations() {
    try {
       this.response = await this.m3uaService.getAssociationsList(this.m3uaSettings!.id );
      if (this.response.status === 200) {
        this.listAssociations = this.response.data;
      } else {
        this.alertsvr.showAlert(4, this.response.message, this.response.comment);
      }
    } catch (error) {
      console.error('Error al cargar sockets:', error);
      this.alertsvr.showAlert(4, "Error", "No se pudo cargar la lista de sockets.");
    }
    this.dtTriggerAssociations.next(this.dtOptions);
  }

  showModal(modal: number) {
    if (modal == this.MODAL_SOCKET) {
      this.dataSocket = null;
      this.modalSocket.show();
    } else if (modal == this.MODAL_ASSOCIATION) {
      this.dataAssociation = {
        reload: true
      };
      this.modalAssociation.show();
    }
  }

  onCloseModal(band: boolean, modal: number) {
    if (modal == this.MODAL_SOCKET) {
      this.dataSocket = null;
      this.modalSocket.hide();
      this.renderer();
    } else if (modal == this.MODAL_ASSOCIATION) {
      this.dataAssociation = null;
      this.modalAssociation.hide();
      this.renderer();
    }
  }

  async onCloseModalDelete(band: boolean) {
    this.modalDelete.hide();
    if (!band) return;

    const isDeleteOperation = this.itemOption === 2;

    if (this.currentDeleteModal === this.MODAL_SOCKET) {
      if (isDeleteOperation) {
        await this.deleteSocket();
      } else {

        this.itemOption = this.socket.enabled === 1 ? 0 : 1;
        await this.changeStatus(this.MODAL_SOCKET);
      }
      this.renderer();
    } else if (this.currentDeleteModal === this.MODAL_ASSOCIATION) {
      if (isDeleteOperation) {
        await this.deleteAssociation();
      } else {
        // Handle change status for association.
        this.itemOption = this.association.enabled === 1 ? 0 : 1;
        await this.changeStatus(this.MODAL_ASSOCIATION);
      }
      this.renderer();

    }
  }

  async deleteSocket() {
    try {
      let message = 'Delete Socket';
      let resp = await this.m3uaService.deleteSocket(this.socket.id);
      if (resp.status == 200) {
        this.alertsvr.showAlert(1, message, resp.comment || 'Socket deleted successfully.');
      } else {
        this.alertsvr.showAlert(2, 'Could not delete the socket', 'Warning');
      }
    } catch (error) {
      console.error('Error deleting socket:', error);
      this.alertsvr.showAlert(3, 'Server error', 'Error occurred while attempting to delete the socket.');
    }
  }

  async deleteAssociation() {
    try {
      let message = 'Delete Assoc';
      let resp = await this.m3uaService.deleteAssociations(this.association.id);
      if (resp.status == 200) {
        this.alertsvr.showAlert(1, resp.message, resp.comment || ' deleted successfully.');
      } else {
        this.alertsvr.showAlert(2, 'Could not delete the Association', 'Warning');
      }
    } catch (error) {
      console.error('Error deleting socket:', error);
      this.alertsvr.showAlert(3, 'Server error', 'Error occurred while attempting to delete the socket.');
    }
  }

  async deleteAssoc(data: any,type:number){
    if (type===this.MODAL_SOCKET) {
      this.socket = data;
      this.modalDelete.show();
      this.currentDeleteModal=type;
      this.itemOption=2;
      this.messageShow = 'Are you sure you want to delete socket';
    } else {
      this.association = data;
      this.modalDelete.show();
      this.currentDeleteModal=type;
      this.itemOption=2;
      this.messageShow = 'Are you sure you want to delete asosociations';
    }

  }

  async renderer() {
    this.dtElements.forEach((dtElement: DataTableDirective) => {
      if(dtElement.dtInstance)
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
      });
    });
    this.loadAssociations();
    this.loadSockets();
  }

  async run(data: any,type:number) {

    if (type===this.MODAL_SOCKET) {
      this.socket = data;
      this.modalDelete.show();
      this.currentDeleteModal=type;
      this.itemOption=1;
      this.messageShow = 'Are you sure you want to start the socket?';
    } else {
      this.association = data;
      this.modalDelete.show();
      this.currentDeleteModal=type;
      this.itemOption=1;
      this.messageShow = 'Are you sure you want to start de association ';
    }

  }

  async stop(data: any,type:number) {
    if (type===this.MODAL_SOCKET) {
      this.socket = data;
      this.modalDelete.show();
      this.currentDeleteModal=type;
      this.itemOption=0;
      this.messageShow = 'Are you sure you want to stop the socket?';
    } else {
      this.association = data;
      this.modalDelete.show();
      this.currentDeleteModal=type;
      this.itemOption=0;
      this.messageShow = 'Are you sure you want to stop de association ';
    }
  }

  async changeStatus(type: number) {
    try {
      const isActive = this.itemOption === 1;

      let message = '';
      let resp
      if (type === this.MODAL_SOCKET) {
        // socket has an `isActive` field. Adjust as necessary.
        this.socket.enabled = this.itemOption;
        resp = await this.m3uaService.updateSocket(this.socket.id, this.socket);

        message = isActive ? 'Socket started successfully.' : 'Socket stopped successfully.';
      } else if (type === this.MODAL_ASSOCIATION) {
        this.association.enabled = this.itemOption;
        resp = await this.m3uaService.updateAssociations(this.association.id, this.association);

        message = isActive ? 'Association started successfully.' : 'Association stopped successfully.';
      }

      // Check response status and show alerts accordingly. based on your  service response.
      if (resp!.status === 200) {
        this.alertsvr.showAlert(1, message, '');
      } else {
        this.alertsvr.showAlert(2, 'Operation failed', 'Please try again.');
      }
    } catch (error) {
      console.error('Error changing status:', error);
      this.alertsvr.showAlert(3, 'Server error', 'An error occurred while changing status.');
    }
  }
  ngOnDestroy(): void {
    this.dtTriggerSocket.unsubscribe();
    this.dtTriggerAssociations.unsubscribe();
    this.subscriptions.unsubscribe();
  }

  loadDtOptions() {
    this.dtOptions = {
      ...this.dtConfigService.getConfig(),
      initComplete: () => {
        this.dtElements.forEach((dtElement: DataTableDirective) => {
          if(dtElement.dtInstance) {
            dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
              dtInstance.on('length.dt', (e: Event, settings: any, len: number) => {
                this.onPageLengthChange(len);
              });
            });
          }
        });
      }
    };
  }

  onPageLengthChange(newPageLength: number): void {
    this.dtConfigService.updateConfig({ pageLength: newPageLength });
    this.dtOptions.pageLength = newPageLength;
  }
}

