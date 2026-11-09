import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import {
  AlertService,
  Retries,
  RetryConfiguration,
  SettingServices,
} from '@app/core';
import { FormSectionConfig } from '@app/core/forms/form-section.model';
import { environment } from '@env/environment';
import {
  RETRY_GENERAL_CONFIGURATION_SECTION,
} from '../config/retry-general-configuration-section.config';

interface RetryConfigurationForm {
  firstRetryDelay: FormControl<number>;
  maxDueDelay: FormControl<number>;
  retryDelayMultiplier: FormControl<number>;
}

function toFiniteNumber(value: unknown, fallback: number): number {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : fallback;
}

@Component({
  selector: 'app-retry-general-configuration',
  templateUrl: 'general-configuration.component.html',
})
export class RetryGeneralConfigurationComponent implements OnInit {

  readonly sectionConfig: FormSectionConfig =
    RETRY_GENERAL_CONFIGURATION_SECTION;

  readonly form: FormGroup<RetryConfigurationForm>;

  isLoading = true;
  isSaving = false;

  private readonly defaultConfiguration: RetryConfiguration = {
    firstRetryDelay: toFiniteNumber(
      environment.generalSettings.retries.firstRetryDelay,
      1
    ),
    maxDueDelay: toFiniteNumber(
      environment.generalSettings.retries.maxDueDelay,
      0
    ),
    retryDelayMultiplier: toFiniteNumber(
      environment.generalSettings.retries.retryDelayMultiplier,
      0
    ),
  };

  constructor(
    private readonly settingServices: SettingServices,
    private readonly alertService: AlertService,
    private readonly formBuilder: NonNullableFormBuilder,
  ) {
    this.form = this.formBuilder.group({
      firstRetryDelay: [
        this.defaultConfiguration.firstRetryDelay,
        [
          Validators.required,
          Validators.min(1),
        ],
      ],
      maxDueDelay: [
        this.defaultConfiguration.maxDueDelay,
        [
          Validators.required,
          Validators.min(0),
        ],
      ],
      retryDelayMultiplier: [
        this.defaultConfiguration.retryDelayMultiplier,
        [
          Validators.required,
          Validators.min(0),
        ],
      ],
    });

    this.form.disable({
      emitEvent: false,
    });
  }

  ngOnInit(): void {
    void this.loadConfiguration();
  }

  async save(): Promise<void> {
    if (this.form.invalid || this.form.disabled || this.isSaving) {
      this.form.markAllAsTouched();

      if (this.form.invalid) {
        this.alertService.showAlert(
          2,
          'Error',
          'Please fill all the required fields'
        );
      }

      return;
    }

    this.isSaving = true;

    const payload: RetryConfiguration = this.form.getRawValue();

    this.form.disable({
      emitEvent: false,
    });

    try {
      const response =
        await this.settingServices.updateRetriesSetting(payload);

      if (response.status !== 200) {
        this.alertService.showAlert(
          4,
          response.message,
          response.comment
        );

        return;
      }

      const savedConfiguration = response.data
        ? this.normalizeConfiguration(response.data)
        : payload;

      this.form.reset(savedConfiguration, {
        emitEvent: false,
      });

      this.form.markAsPristine();

      this.alertService.showAlert(
        1,
        response.message,
        response.comment
      );
    } catch {
      this.alertService.showAlert(
        4,
        'Error',
        'Unable to update the retry configuration'
      );
    } finally {
      this.isSaving = false;

      this.form.enable({
        emitEvent: false,
      });
    }
  }

  private async loadConfiguration(): Promise<void> {
    this.isLoading = true;

    this.form.disable({
      emitEvent: false,
    });

    try {
      const response =
        await this.settingServices.getRetriesSetting();

      if (response.status !== 200 || !response.data) {
        this.alertService.showAlert(
          4,
          response.message,
          response.comment
        );

        return;
      }

      this.form.reset(
        this.normalizeConfiguration(response.data),
        {
          emitEvent: false,
        }
      );

      this.form.markAsPristine();

      this.form.enable({
        emitEvent: false,
      });
    } catch {
      this.alertService.showAlert(
        4,
        'Error',
        'Unable to load the retry configuration'
      );
    } finally {
      this.isLoading = false;
    }
  }

  private normalizeConfiguration(
    configuration: Partial<Retries>
  ): RetryConfiguration {
    return {
      firstRetryDelay: toFiniteNumber(
        configuration.firstRetryDelay,
        this.defaultConfiguration.firstRetryDelay
      ),
      maxDueDelay: toFiniteNumber(
        configuration.maxDueDelay,
        this.defaultConfiguration.maxDueDelay
      ),
      retryDelayMultiplier: toFiniteNumber(
        configuration.retryDelayMultiplier,
        this.defaultConfiguration.retryDelayMultiplier
      ),
    };
  }
}