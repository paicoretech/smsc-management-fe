import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Realm } from '@app/core/interfaces/ChargingSetting';

@Component({
    selector: 'app-add-realms',
    templateUrl: './add-realms.component.html',
})
export class AddRealmsComponent implements OnInit {

    @Output() closeModal: EventEmitter<Realm> = new EventEmitter();
    @Input() set dataUpdate(value: any) {
        if (value != null && value != undefined) {
            this.form.patchValue(value);
            this.title = 'Edit Realm';
        } else {
            this.initializeForm();
        }
    }
    title: string = 'Add Realm';
    form!: FormGroup;

    constructor(
        private fb: FormBuilder
    ) { }

    ngOnInit(): void {
        this.initializeForm();
    }

    initializeForm(): void {
        this.form = this.fb.group({
            id: [{ value: 0, disabled: true }, [Validators.required]],
            name: ['', [Validators.required]],
            uri: ['', [Validators.required]],
            peers: ['', [Validators.required]],
            dynamic: [false, [Validators.required]],
            application: this.fb.group({
                id: [null],
                name: ['', [Validators.required]],
                delete: [false],
                vendor_id: [0, [Validators.required]],
                auth_appl_id: [0, [Validators.required]],
                acct_appl_id: [0, [Validators.required]],
            }),
            applicationId: [null],
            delete: [false],
            local_action: ['LOCAL', [Validators.required]],
            exp_time: [0, [Validators.required]],
        });
    }

    save(): void {
        if (this.form.valid) {
            this.closeModal.emit(this.form.getRawValue());
            this.initializeForm();
        }
    }

    close(): void {
        this.closeModal.emit();
    }

    validInput(name: string) {
        return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
    }

    validPattern(name: string) {
        return this.form.get(name)?.touched && this.form.get(name)?.errors?.['pattern'];
    }

    getPatternMessage(name: string) {
        if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[A-Za-z0-9]*$') {
            return 'Only alphanumeric characters are allowed';
        } else if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[^\\s]+$') {
            return 'No spaces allowed';
        } else {
            return 'Only numbers are allowed';
        }
    }
}