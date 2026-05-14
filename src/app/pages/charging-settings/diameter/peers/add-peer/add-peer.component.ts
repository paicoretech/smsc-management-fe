import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Peer } from '@app/core/interfaces/ChargingSetting';

@Component({
    selector: 'app-add-peer',
    templateUrl: './add-peer.component.html',
})
export class AddPeerComponent implements OnInit {

    @Output() closeModal: EventEmitter<Peer> = new EventEmitter();
    @Input() set dataUpdate(value: Peer | null) {
        if (value != null && value != undefined) {
            this.form.patchValue(value);
            this.title = 'Edit Peer';
        } else {
            this.initializeForm();
        }
    }
    title: string = 'Add Peer';
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
            rating: ['', [Validators.required]],
            host: [''],
            applications: [''],
            ip: ['', [Validators.required]],
            attempt_connect: [false],
            port_range: [''],
            security_ref: [''],
            standby_addresses: [''],
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
        this.initializeForm();
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