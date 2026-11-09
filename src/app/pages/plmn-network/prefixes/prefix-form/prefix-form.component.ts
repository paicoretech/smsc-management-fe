import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AlertService, PlmnNetwork, PlmnNetworkService, PlmnPrefix, PlmnPrefixPayload } from '@core/index';

@Component({
  selector: 'app-plmn-prefix-form',
  templateUrl: './prefix-form.component.html',
})
export class PrefixFormComponent implements OnInit {
  @Output() closeModal = new EventEmitter<boolean>();
  @Input() networks: PlmnNetwork[] = [];

  @Input() set prefix(value: PlmnPrefix | undefined) {
    this.currentPrefix = value;
    if (this.form) {
      this.populateForm();
    }
  }

  form!: FormGroup;
  isEdit = false;
  title = 'Create Prefix';

  private currentPrefix?: PlmnPrefix;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly plmnNetworkService: PlmnNetworkService,
    private readonly alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group(
      {
        id: [undefined],
        prefix: ['', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.maxLength(15)]],
        sn_range_start: ['', [Validators.pattern(/^[0-9]*$/), Validators.maxLength(15)]],
        sn_range_stop: ['', [Validators.pattern(/^[0-9]*$/), Validators.maxLength(15)]],
        plmn_id: [null, [Validators.required]],
      },
      { validators: this.rangeValidator() },
    );
    this.populateForm();
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: PlmnPrefixPayload = {
      id: raw.id ?? undefined,
      prefix: raw.prefix.trim(),
      sn_range_start: this.optionalValue(raw.sn_range_start),
      sn_range_stop: this.optionalValue(raw.sn_range_stop),
      plmn_id: Number(raw.plmn_id),
    };

    const response = this.isEdit && this.currentPrefix
      ? await this.plmnNetworkService.updatePrefix(this.currentPrefix.id, payload)
      : await this.plmnNetworkService.createPrefix(payload);

    if (response.status === 200) {
      this.alertService.showAlert(1, response.message, response.comment);
      this.closeModal.emit(true);
      this.form.reset();
    } else {
      this.alertService.showAlert(2, response.message, response.comment);
    }
  }

  cancel(): void {
    this.closeModal.emit(false);
    this.form.reset();
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control?.touched && control.invalid);
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control?.touched && control.hasError(errorName));
  }

  hasFormError(errorName: string): boolean {
    return !!(this.form.touched && this.form.hasError(errorName));
  }

  formatNetwork(network: PlmnNetwork): string {
    return `${network.mcc}-${network.mnc} · ${network.network_name}`;
  }

  private populateForm(): void {
    this.isEdit = !!this.currentPrefix;
    this.title = this.isEdit ? 'Edit Prefix' : 'Create Prefix';

    if (!this.form) {
      return;
    }

    this.form.reset({
      id: this.currentPrefix?.id,
      prefix: this.currentPrefix?.prefix ?? '',
      sn_range_start: this.currentPrefix?.sn_range_start ?? '',
      sn_range_stop: this.currentPrefix?.sn_range_stop ?? '',
      plmn_id: this.currentPrefix?.plmn_id ?? null,
    });
  }

  private optionalValue(value: string | null | undefined): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private rangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const prefix = String(control.get('prefix')?.value ?? '').trim();
      const start = String(control.get('sn_range_start')?.value ?? '').trim();
      const stop = String(control.get('sn_range_stop')?.value ?? '').trim();
      if (!start && !stop) {
        return null;
      }
      if (!start || !stop) {
        return { rangePair: true };
      }
      if (start.length !== stop.length) {
        return { rangeLength: true };
      }
      if (!start.startsWith(prefix) || !stop.startsWith(prefix)) {
        return { rangePrefix: true };
      }
      if (start > stop) {
        return { rangeOrder: true };
      }
      return null;
    };
  }
}
