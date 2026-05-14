import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AlertService, DndService, ResponseI} from '@core/index';
import {DataTableDirective} from 'angular-datatables';
import {Subject} from 'rxjs';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.css'],
})
export class DetailComponent implements OnInit, OnDestroy {
    @Input() viewOnly: boolean = false;
    @ViewChild(DataTableDirective, {static: false})
    dtElement!: DataTableDirective;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject<any>();
    searchTerm: string = '';
    dataTable: any;
    @Input() networksList: any[] = [];
    @Output() closeModal: EventEmitter<any> = new EventEmitter();
    dndEntry: any;
    title: string = 'DND Details';
    msisdnList: any[] = [];
    dndForm!: FormGroup;
    isEditingName = false;
    editNameValue = '';
    private showRowIcons = false;

    constructor(
        private dndService: DndService,
        private alertSvr: AlertService,
        private fb: FormBuilder
    ) {
    }

    @Input() set dataUpdate(value: any) {
        if (value != null && value !== undefined) {
            this.dndEntry = value;
            const disabled = this.viewOnly || this.dndEntry?.status === 'DISABLED';
            if (disabled) this.dndForm?.get('msisdns')?.disable();
            else this.dndForm?.get('msisdns')?.enable();
            this.showRowIcons = !this.viewOnly && this.dndEntry?.status === 'ACTIVE';
            this.renderer();
        }
    }

    ngOnInit(): void {
        this.dndForm = this.fb.group({
            msisdns: ['', Validators.required]
        });

        const disabled = this.viewOnly || this.dndEntry?.status === 'DISABLED';
        if (disabled) this.dndForm.get('msisdns')?.disable(); else this.dndForm.get('msisdns')?.enable();
        this.showRowIcons = !this.viewOnly && this.dndEntry?.status === 'ACTIVE';
        this.loadDtOptions();
        this.dtTrigger.next(this.dtOptions);
    }

    async onSubmit(): Promise<void> {
        if (this.viewOnly) return;
        if (this.dndForm.invalid || !this.dndEntry?.id) return;


        const rawInput = this.dndForm.value.msisdns;
        const msisdnArray = rawInput
            .split(',')
            .map((msisdn: string) => msisdn.trim())
            .filter((msisdn: string) => msisdn.length > 0);
        const nonNumeric = msisdnArray.filter((m: string) => !/^\d+$/.test(m));
        if (nonNumeric.length > 0) {
            this.alertSvr.error(`Only numeric MSISDNs are allowed.`);
            return;
        }
        try {
            const response: ResponseI = await this.dndService.createDndEntries(this.dndEntry.id, msisdnArray);
            const {status, data} = response;
            if (status === 200) {
                if (data?.had_duplicate) {
                    this.alertSvr.showAlert(2, 'Duplicate MSISDNs, Please add valid MSISDNs', 'Warning');
                }else{
                    this.alertSvr.success('MSISDN list saved successfully');
                }
                this.renderer();
                this.dndForm.reset();
            }  else {
                this.alertSvr.error(response.message || 'Could not save MSISDN list');
            }
        } catch (error) {
            console.error('Error saving MSISDN list:', error);
        }
    }

    renderer(): void {
        if (!this.dtElement || !this.dtElement.dtInstance) {
            if (this.dtOptions && (this.dtOptions as any).ajax) {
                this.dtTrigger.next(this.dtOptions);
            }
            return;
        }
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.ajax.reload(() => {
                dtInstance.page(0);
                dtInstance.columns.adjust();
                dtInstance.columns.adjust().draw(false);
            }, false);
        });
    }

    loadDtOptions(): void {
        this.dtOptions = {
            serverSide: true,
            processing: true,
            paging: true,
            searching: false,
            scrollX: true,
            pageLength: 10,
            ajax: async (dataTablesParameters: any, callback) => {
                const offset = Math.floor(dataTablesParameters.start / dataTablesParameters.length) + 1;
                const limit = dataTablesParameters.length;

                try {
                    const response: any = await this.dndService.getDndEntriesById(this.dndEntry.id, offset, limit, this.searchTerm || '');
                    const result = response?.data || [];

                    const rows = Array.isArray(result?.data)
                        ? result.data
                        : (Array.isArray(result) ? result : []);

                    const total =
                        typeof result?.total_elements === 'number'
                            ? result.total_elements
                            : (Array.isArray(rows) ? rows.length : 0);

                    callback({
                        recordsTotal: total,
                        recordsFiltered: total,
                        data: Array.isArray(rows) ? rows : []
                    });
                } catch (error) {
                    callback({
                        recordsTotal: 0,
                        recordsFiltered: 0,
                        data: []
                    });
                }
            },
            columns: [
                {
                    data: 'msisdn',
                    title: 'MSISDN',
                    width: '100%',
                    render: (msisdn: any) => {
                        if (!this.showRowIcons) {
                            return `<span>${(msisdn)}</span>`;
                        }
                        return `
              <div class="d-flex align-items-center justify-content-between w-100">
                <span>${(msisdn)}</span>
                <button type="button" class="btn  btn-sm  btn-secondary me-2 btn-delete-msisdn" data-msisdn="${(msisdn)}">
                  <i class='bx bx-trash'></i>
                </button>
              </div>
            `;
                    }
                }
            ],
            createdRow: (row: Node) => {
                if (!this.showRowIcons) return;
                const $row = (window as any)['$'] ? (window as any)['$'](row) : null;
                if ($row) {
                    $row.off('click', '.btn-delete-msisdn');
                    $row.on('click', '.btn-delete-msisdn', (e: any) => {
                        const target = e.currentTarget as HTMLElement;
                        const msisdn = target.getAttribute('data-msisdn') || '';
                        if (msisdn) this.onDeleteMsisdn(msisdn);
                    });
                }
            }
        };
    }

    getNetworkById(id: string): string {
        return this.networksList.find(item => item.network_id == id).name || '';
    }

    onSearch(event: any): void {
        this.searchTerm = event.target.value;
        this.renderer();
    }

    close(): void {
        this.closeModal.emit(true);
    }

    canRename(): boolean {
        return !!this.dndEntry?.id && this.dndEntry?.status === 'ACTIVE' && !this.viewOnly;
    }

    startRename(): void {
        if (!this.canRename()) return;
        this.isEditingName = true;
        this.editNameValue = this.dndEntry?.name || '';
    }

    cancelRename(): void {
        this.isEditingName = false;
        this.editNameValue = this.dndEntry?.name || '';
    }

    async saveRename(): Promise<void> {
        if (!this.canRename()) return;
        const name = (this.editNameValue || '').trim();
        if (!name || name === this.dndEntry?.name) {
            this.isEditingName = false;
            return;
        }
        try {
            const res = await this.dndService.renameDndList(this.dndEntry.id, name);
            if (res.status === 200) {
                this.dndEntry.name = name;
                this.alertSvr.success('Name updated');
                this.isEditingName = false;
            } else {
                this.alertSvr.error(res.message || 'Failed to update name');
            }
        } catch {
            this.alertSvr.error('Failed to update name');
        }
    }

    async onDeleteMsisdn(msisdn: string): Promise<void> {
        if (this.viewOnly || this.dndEntry?.status !== 'ACTIVE') return;
        try {
            const res = await this.dndService.deleteMsisdn(this.dndEntry.id, msisdn);
            if (res.status === 200) {
                this.alertSvr.success('MSISDN deleted');
                this.renderer();
            } else {
                this.alertSvr.error(res.message || 'Failed to delete MSISDN');
            }
        } catch {
            this.alertSvr.error('Failed to delete MSISDN');
        }
    }
    ngOnDestroy(): void {
        this.dtTrigger.unsubscribe();
    }
}