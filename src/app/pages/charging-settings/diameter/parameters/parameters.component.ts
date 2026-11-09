import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Parameters } from '@app/core/interfaces/ChargingSetting';
import { Subscription } from 'rxjs';
import { DIAMETER_PARAMETERS_SECTION } from '../config/diameter-parameters-section.config';

@Component({
    selector: 'app-parameters',
    templateUrl: './parameters.component.html',
})
export class ParameterComponent implements OnInit, OnChanges, OnDestroy {

    @Input() parameters!: Parameters;
    @Output() parametersChange = new EventEmitter<Parameters>();
    @Input() isDisabled: boolean = false;
    parameterForm!: FormGroup;
    parametersSection = DIAMETER_PARAMETERS_SECTION;
    private formSub?: Subscription;
    private requestTableSizeSub?: Subscription;

    constructor(
        private fb: FormBuilder,
    ) { }

    ngOnInit(): void {
        this.initializeForm();
        if (this.parameters) {
            this.parameterForm.patchValue(this.parameters);
        }

        setTimeout(() => this.emitChanges(), 100);

        this.formSub = this.parameterForm.valueChanges.subscribe(() => {
            this.emitChanges();
        });

        this.requestTableSizeSub = this.parameterForm.get('request_table_size')?.valueChanges.subscribe(() => {
            this.onRequestTableSizeChange();
        });

        this.toggleFormState();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isDisabled']) {
            this.toggleFormState();
        }
    }

    ngOnDestroy(): void {
        this.formSub?.unsubscribe();
        this.requestTableSizeSub?.unsubscribe();
    }

    initializeForm(): void {
        this.parameterForm = this.fb.group({
            id: [{ value: 0, disabled: true }],
            accept_undefined_peer: [true, [Validators.required]],
            duplicate_protection: [true, [Validators.required]],
            duplicate_timer: [10000, [Validators.required]],
            duplicate_size: [240000, [Validators.required]],
            use_uri_as_fqdn: [false, [Validators.required]],
            queue_size: [1000, [Validators.required]],
            message_time_out: [10000, [Validators.required]],
            stop_time_out: [5000, [Validators.required]],
            cea_time_out: [10000, [Validators.required]],
            iac_time_out: [10000, [Validators.required]],
            dwa_time_out: [10000, [Validators.required]],
            dpa_time_out: [10000, [Validators.required]],
            rec_time_out: [10000, [Validators.required]],
            peer_fsm_thread_count: [3, [Validators.required]],
            single_local_peer: [true, [Validators.required]],
            session_time_out: [10000, [Validators.required]],
            bind_delay: [10000, [Validators.required]],
            request_table_size: [1024, [Validators.required]],
            request_table_clear_size: [528, [Validators.required]],
        }, { validators: [this.clearLessThanSize()] });
    }

    private clearLessThanSize(): ValidatorFn {
        return (fg: AbstractControl): ValidationErrors | null => {
            const req = fg.get('request_table_size')?.value;
            const clr = fg.get('request_table_clear_size')?.value;
            if (req == null || clr == null) return null;
            return clr < req ? null : { clearSizeGteSize: true };
        };
    }

    emitChanges(): void {
        if (this.parameterForm.enabled && !this.parameterForm.valid) return;
        this.parametersChange.emit({
            ...this.parameters,
            ...this.parameterForm.getRawValue()
        });
    }

    toggleFormState(): void {
        setTimeout(() => {
            if (this.isDisabled) {
                this.parameterForm.disable();
            } else {
                this.parameterForm.enable();
            }
        });
    }

    onRequestTableSizeChange(): void {
        const requestSize = this.parameterForm.get('request_table_size')?.value;
        const clearSizeControl = this.parameterForm.get('request_table_clear_size');

        if (!clearSizeControl) return;

        if (clearSizeControl.value >= requestSize) {
            clearSizeControl.setValue(requestSize - 1, { emitEvent: false });
            clearSizeControl.updateValueAndValidity({ emitEvent: false });
            this.parameterForm.updateValueAndValidity({ emitEvent: false });
            this.emitChanges();
        }
    }
}
