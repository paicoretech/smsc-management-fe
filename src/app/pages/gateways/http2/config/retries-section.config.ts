import { FormSectionConfig } from "@app/core/forms/form-section.model";

export const RETRIES_SECTION: FormSectionConfig = {
    title: 'Retries',
    topMargin: false,
    columns: [
        [
            {
                type: 'text',
                controlName: 'auto_retry_error_code',
                label: 'Auto Retry Error Codes',
            },
            {
                type: 'text',
                controlName: 'no_retry_error_code',
                label: 'No Retry Error Codes',
            },
        ],
        [
            {
                type: 'text',
                controlName: 'retry_alternate_destination_error_code',
                label: 'Retry Alternate Destination Error Codes',
            },
        ],
    ],
};
