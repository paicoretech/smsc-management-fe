import { FormSectionConfig } from '@app/core/forms/form-section.model';

export const DIAMETER_GATEWAY_RETRIES_SECTION: FormSectionConfig = {
  title: 'Retries',
  topMargin: true,
  columns: [
    [
      {
        type: 'text',
        controlName: 'auto_retry_error_code',
        label: 'Auto Retry Error Codes',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
      {
        type: 'text',
        controlName: 'no_retry_error_code',
        label: 'No Retry Error Codes',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
    ],
    [
      {
        type: 'text',
        controlName: 'retry_alternate_destination_error_code',
        label: 'Retry Alternate Destination Error Codes',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
    ],
  ],
};
