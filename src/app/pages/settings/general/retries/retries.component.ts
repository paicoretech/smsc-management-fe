import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, ResponseI, Retries, SettingServices } from '@app/core';
import { environment } from '@env/environment';

@Component({
  selector: 'app-retries',
  templateUrl: './retries.component.html',
  styleUrls: ['./retries.component.scss'],
})
export class RetriesComponent implements OnInit {

  form!: FormGroup;
  reponse!: ResponseI;
  retries!: Retries;
  default = environment.generalSettings.retries;

  constructor(
    private settingServices: SettingServices,
    private alertSvr: AlertService,
    private fb: FormBuilder,
  ) { 
  }

  ngOnInit(): void {
    this.initForm();
    this.getData();
  }

  initForm() {
    this.form = this.fb.group({
      firstRetryDelay: [this.default.firstRetryDelay, [Validators.required, Validators.min(1)]],
      maxDueDelay: [this.default.maxDueDelay, [Validators.required, Validators.min(0)]],
      retryDelayMultiplier: [this.default.retryDelayMultiplier, [Validators.required, Validators.min(0)]],
    });
  }

  async getData() {
    this.reponse = await this.settingServices.getRetriesSetting();

    if (this.reponse.status == 200) {
      this.retries = this.reponse.data;
      this.form.patchValue({
        firstRetryDelay: (this.retries.firstRetryDelay !== null && this.retries.firstRetryDelay !== undefined) ? this.retries.firstRetryDelay : this.default.firstRetryDelay,
        maxDueDelay: (this.retries.maxDueDelay !== null && this.retries.maxDueDelay !== undefined) ? this.retries.maxDueDelay : this.default.maxDueDelay,
        retryDelayMultiplier: (this.retries.retryDelayMultiplier !== null && this.retries.retryDelayMultiplier !== undefined) ? this.retries.retryDelayMultiplier : this.default.retryDelayMultiplier,
      });
    }
  }

  async save() {
    if (!this.form.valid) {
      this.alertSvr.showAlert(2, 'Error', 'Please fill all the required fields');
    }

    this.reponse = await this.settingServices.updateRetriesSetting(this.form.value);

    if (this.reponse.status == 200) {
      this.alertSvr.showAlert(1, this.reponse.message, this.reponse.comment);
    } else {
      this.alertSvr.showAlert(4, this.reponse.message, this.reponse.comment);
    }
  }

  validInput(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
  }

  validMin(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['min'];
  }

  validPattern(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['pattern'];
  }

  getMin(name: string) {
    return this.form.get(name)?.errors?.['min']?.min;
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

  cleanForm() {
    this.form.reset();
  }
}