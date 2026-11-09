import { FormSectionConfig } from '@app/core/forms/form-section.model';

export const RETRY_GENERAL_CONFIGURATION_SECTION: FormSectionConfig = {
  title: 'Retry Configuration',
  topMargin: false,
  columns: [
    [
      {
        type: 'number',
        controlName: 'firstRetryDelay',
        label: 'First Retry Delay (Seconds)',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
      {
        type: 'number',
        controlName: 'maxDueDelay',
        label: 'Max Due Delay (Seconds)',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
    ],
    [
      {
        type: 'number',
        controlName: 'retryDelayMultiplier',
        label: 'Retry Delay Multiplier',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
    ],
  ],
};