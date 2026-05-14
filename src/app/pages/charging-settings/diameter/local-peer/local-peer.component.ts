import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableConfigService } from '@app/core';
import { Application, LocalPeer } from '@app/core/interfaces/ChargingSetting';
import { environment } from '@env/environment';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

declare var window: any;

@Component({
    selector: 'app-local-peer',
    templateUrl: './local-peer.component.html',
})
export class LocalPeerComponent implements OnInit, OnDestroy {

    @ViewChild(DataTableDirective, { static: false }) dtElement!: DataTableDirective;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject<any>();
    dataTable: any;

    @Input() localPeer: LocalPeer | null = null;
    @Input() isDisabled: boolean = false;

    @Output() localPeerChange = new EventEmitter<{
        localPeer: LocalPeer,
        applications: Application[],
        modified?: boolean;
        source?: 'form' | 'applications';
    }>();

    localPeerForm!: FormGroup;
    applicationList: Application[] = [];
    selectedApplication: Application | null = null;
    application!: Application;

    formModal: any;
    formModalDelete: any;
    messageShow: string = '';
    private initialSnapshot = '';

    constructor(
        private fb: FormBuilder,
        private dtConfigService: DataTableConfigService,
        private cdRef: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadDtOptions();
        this.initializeForm();
        this.initializeLocalPeer();

        this.initialSnapshot = this.computeStateHash();

        this.localPeerForm.valueChanges.subscribe(() => {
            this.emitChanges('form');
        });

        this.formModal = new window.bootstrap.Modal(document.getElementById('modalLocalPeer'));
        this.formModalDelete = new window.bootstrap.Modal(document.getElementById('modalDeleteLocalPeer'));

        this.toggleFormState();
    }

    private computeStateHash(): string {
        const state = {
            ...this.localPeerForm.getRawValue(),
            applications: this.applicationList,
        };
        return JSON.stringify(state);
    }

    initializeLocalPeer() {
        if (this.localPeer) {
            this.localPeerForm.patchValue(this.localPeer);
            this.applicationList = [...(this.localPeer.applications || [])];
        }

        setTimeout(() => {
            this.dtTrigger.next(this.dtOptions);
        }, 1000);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isDisabled']) {
            this.toggleFormState();
        }
    }

    toggleFormState(): void {
        setTimeout(() => {
            if (this.localPeerForm) {
                if (this.isDisabled) {
                    this.localPeerForm.disable();
                } else {
                    this.localPeerForm.enable();
                }
                this.cdRef.detectChanges();
            }
        });
    }

    initializeForm(): void {
        this.localPeerForm = this.fb.group({
            id: [{ value: 0, disabled: true }],
            uri: ['', [Validators.required]],
            realm: ['', [Validators.required]],
            ip_addresses: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(environment.MaxLengthIp)]],
            vendor_id: ['', [Validators.required]],
            product_name: ['', [Validators.required]],
            firmware_version: ['', [Validators.required]],
        });
    }

    addApplication(application: Application) {
        if (this.selectedApplication) {
            const index = this.applicationList.findIndex(app => app.id === this.selectedApplication!.id);
            if (index !== -1) {
                this.applicationList[index] = { ...application };
            }
        } else {
            if (!application.id) {
                application.id = Date.now();
            }
            this.applicationList.push(application);
        }

        this.selectedApplication = null;
        this.emitChanges('applications');
        this.refreshDataTable();
    }

    editApplication(application: Application) {
        this.selectedApplication = application;
        this.formModal.show();
    }

    deleteApplication(application: Application) {
        this.application = application;
        this.formModalDelete.show();
        this.messageShow = 'Are you sure you want to delete the application?';
    }

    emitChanges(source: 'form' | 'applications' = 'form') {
        const currentHash = this.computeStateHash();
        const modified = currentHash !== this.initialSnapshot;

        this.localPeerChange.emit({
            localPeer: { ...this.localPeer, ...this.localPeerForm.value },
            applications: this.applicationList,
            modified,
            source,
        });
    }

    showModal(): void {
        this.selectedApplication = null;
        this.formModal.show();
    }

    onCloseModal(application?: Application): void {
        this.formModal.hide();
        if (application) {
            this.addApplication(application);
        }
    }

    async onCloseModalDelete(confirm: boolean) {
        this.formModalDelete.hide();

        if (confirm && this.application) {
            const index = this.applicationList.findIndex(app => app.id === this.application.id);
            if (index !== -1) {
                this.applicationList.splice(index, 1);
                this.emitChanges('applications');
            }
        }

        this.application = {} as Application;
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
                if (this.dtElement?.dtInstance) {
                    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                        dtInstance.on('length.dt', (e: Event, settings: any, len: number) => {
                            this.onPageLengthChange(len);
                        });
                    });
                }
            }
        };
    }

    onPageLengthChange(newPageLength: number): void {
        this.dtConfigService.updateConfig({ pageLength: newPageLength });
        this.dtOptions.pageLength = newPageLength;
    }

    validInput(name: string) {
        return this.localPeerForm.get(name)?.touched && this.localPeerForm.get(name)?.errors?.['required'];
    }

    validMin(name: string) {
        return this.localPeerForm.get(name)?.touched && this.localPeerForm.get(name)?.errors?.['min'];
    }

    validMinLength(name: string) {
        return this.localPeerForm.get(name)?.touched && this.localPeerForm.get(name)?.errors?.['minlength'];
    }

    validMaxLength(name: string) {
        return this.localPeerForm.get(name)?.touched && this.localPeerForm.get(name)?.errors?.['maxlength'];
    }

    validPattern(name: string) {
        return this.localPeerForm.get(name)?.touched && this.localPeerForm.get(name)?.errors?.['pattern'];
    }

    getMin(name: string) {
        return this.localPeerForm.get(name)?.errors?.['min']?.min;
    }

    getMinLength(name: string) {
        return this.localPeerForm.get(name)?.errors?.['minlength']?.requiredLength;
    }

    getMaxLength(name: string) {
        return this.localPeerForm.get(name)?.errors?.['maxlength']?.requiredLength;
    }

    getPatternMessage(name: string) {
        if (this.localPeerForm.get(name)?.errors?.['pattern']?.requiredPattern == '^[A-Za-z0-9]*$') {
            return 'Only alphanumeric characters are allowed';
        } else if (this.localPeerForm.get(name)?.errors?.['pattern']?.requiredPattern == '^[^\\s]+$') {
            return 'No spaces allowed';
        } else {
            return 'Only numbers are allowed';
        }
    }
}
