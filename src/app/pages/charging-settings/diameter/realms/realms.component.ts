import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DataTableConfigService } from '@app/core';
import { Realm } from '@app/core/interfaces/ChargingSetting';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

declare var window: any;

@Component({
    selector: 'app-realms',
    templateUrl: './realms.component.html',
})
export class RealmsComponent implements OnInit, OnDestroy {

    @ViewChild(DataTableDirective, { static: false }) dtElement!: DataTableDirective;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject<any>();

    @Output() realmsChange = new EventEmitter<Realm[]>();
    @Input() realms: Realm[] = [];
    @Input() isDisabled: boolean = false;

    realmsList: Realm[] = [];
    selectedRealm: Realm | null = null;
    formModal: any;
    formModalDelete: any;
    messageShow: string = '';

    constructor(
        private dtConfigService: DataTableConfigService,
    ) { }

    ngOnInit(): void {
        this.loadDtOptions();
        this.initializeRealms();

        this.formModal = new window.bootstrap.Modal(document.getElementById('modalRealm'));
        this.formModalDelete = new window.bootstrap.Modal(document.getElementById('modalDeleteRealm'));
    }

    initializeRealms(): void {
        if (this.realms) {
            this.realmsList = [...this.realms];
        }

        setTimeout(() => {
            this.dtTrigger.next(this.dtOptions);
        }, 1000);
    }

    emitChanges(): void {
        this.realmsChange.emit([...this.realmsList]);
    }

    showModal(): void {
        this.formModal.show();
    }

    addRealm(realm: Realm): void {
        if (this.selectedRealm) {
            const index = this.realmsList.findIndex(r => r.id === this.selectedRealm!.id);
            if (index !== -1) {
                this.realmsList[index] = { ...realm };
            }
        } else {
            if (!realm.id) {
                realm.id = Date.now();
            }
            this.realmsList.push(realm);
        }

        this.selectedRealm = null;
        this.emitChanges();
        this.refreshDataTable();
    }

    editRealm(realm: Realm): void {
        this.selectedRealm = realm;
        this.formModal.show();
    }

    deleteRealm(realm: Realm): void {
        this.selectedRealm = realm;
        this.messageShow = `Are you sure you want to delete the realm?`;
        this.formModalDelete.show();
    }

    onCloseModal(realm?: Realm): void {
        this.formModal.hide();
        if (realm) {
            this.addRealm(realm);
        }
    }

    async onCloseModalDelete(confirm: boolean): Promise<void> {
        this.formModalDelete.hide();

        if (confirm && this.selectedRealm) {
            this.realmsList = this.realmsList.filter(r => r.id !== this.selectedRealm!.id);
            this.emitChanges();
        }

        this.selectedRealm = null;
        this.refreshDataTable();
    }

    ngOnDestroy(): void {
        this.dtTrigger.unsubscribe();
    }

    private refreshDataTable(): void {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.destroy();
            this.dtTrigger.next(this.dtOptions);
        });
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
