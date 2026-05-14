import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Application } from '@app/core/interfaces/ChargingSetting';

@Component({
    selector: 'app-add-local-peer',
    templateUrl: './add-local-peer.component.html',
})
export class AddLocalPeerComponent implements OnInit {

    @Output() closeModal: EventEmitter<Application> = new EventEmitter();
    @Input() set dataUpdate(value: Application | null) {
        if (value) {
            this.form.patchValue(value);
            this.title = 'Edit Application';
        } else {
            this.initializeForm();
        }
    }

    title: string = 'Add Application';
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
            vendor_id: [0, [Validators.required]],
            auth_appl_id: [0, [Validators.required]],
            acct_appl_id: [0, [Validators.required]],
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
        } else if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[^\s]+$') {
            return 'No spaces allowed';
        } else {
            return 'Only numbers are allowed';
        }
    }
}
