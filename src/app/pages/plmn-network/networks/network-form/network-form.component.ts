import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  AlertService,
  PlmnCountry,
  PlmnNetwork,
  PlmnNetworkPayload,
  PlmnNetworkService,
} from '@core/index';

@Component({
  selector: 'app-plmn-network-form',
  templateUrl: './network-form.component.html',
})
export class NetworkFormComponent implements OnInit {
  @Output() closeModal = new EventEmitter<boolean>();

  @Input() set network(value: PlmnNetwork | undefined) {
    this.currentNetwork = value;
    if (this.form) {
      this.populateForm();
    }
  }

  form!: FormGroup;
  isEdit = false;
  title = 'Create Network';
  countries: PlmnCountry[] = [];
  mccOptions: PlmnCountry[] = [];

  private currentNetwork?: PlmnNetwork;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly plmnNetworkService: PlmnNetworkService,
    private readonly alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      mnc: ['', [Validators.required, Validators.pattern(/^[0-9]{2,3}$/)]],
      network_name: ['', [Validators.required]],
      mcc: ['', [Validators.required]],
      plmn_country_id: ['', [Validators.required]],
    });
    this.populateForm();
    void this.loadCountries();
  }

  get countryCodeOptions(): PlmnCountry[] {
    const mcc = this.form?.get('mcc')?.value;
    return this.countries.filter(option => option.mcc === mcc);
  }

  onMccChange(): void {
    const firstCountryCode = this.countryCodeOptions[0];
    this.form.get('plmn_country_id')?.setValue(firstCountryCode?.id ?? '');
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: PlmnNetworkPayload = {
      mnc: raw.mnc.trim(),
      network_name: raw.network_name.trim(),
      plmn_country_id: Number(raw.plmn_country_id),
    };

    const response = this.isEdit && this.currentNetwork
      ? await this.plmnNetworkService.updateNetwork(this.currentNetwork.id, payload)
      : await this.plmnNetworkService.createNetwork(payload);

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

  private populateForm(): void {
    this.isEdit = !!this.currentNetwork;
    this.title = this.isEdit ? 'Edit Network' : 'Create Network';

    if (!this.form) {
      return;
    }

    this.form.reset({
      mnc: this.currentNetwork?.mnc ?? '',
      network_name: this.currentNetwork?.network_name ?? '',
      mcc: this.currentNetwork?.mcc ?? '',
      plmn_country_id: this.currentNetwork?.plmn_country_id ?? '',
    });
  }

  private async loadCountries(): Promise<void> {
    const response = await this.plmnNetworkService.getCountries();
    if (response.status !== 200) {
      this.alertService.showAlert(2, response.message, response.comment);
      return;
    }

    this.countries = response.data ?? [];
    this.mccOptions = Array.from(
      new Map(this.countries.map(country => [country.mcc, country])).values(),
    ).sort((first, second) =>
      first.country.localeCompare(second.country)
      || first.mcc.localeCompare(second.mcc, undefined, { numeric: true }),
    );
    this.populateForm();
  }
}
