import { FormSectionConfig } from "@app/core/forms/form-section.model";

export const TIME_SECTION: FormSectionConfig = {
    title: 'Timers & Timeouts',
    topMargin: false,
    columns: [
        [
            {
                type: 'number',
                controlName: 'request_timeout_ms',
                label: 'Request Timeout (ms)'
            },
            {
                type: 'number',
                controlName: 'connection_timeout_ms',
                label: 'Connection Timeout (ms)'
            },
        ],
        [
            {
                type: 'number',
                controlName: 'idle_timeout_ms',
                label: 'Idle Timeout (ms)'
            },
            {
                type: 'number',
                controlName: 'max_response_time_ms',
                label: 'Max Response Time (ms)',
                groupErrorKey: 'maxResponseLtRequest',
                groupErrorFields: ['max_response_time_ms', 'request_timeout_ms'],
                groupErrorMessage: 'Max response time must be greater than or equal to request timeout',
            },
        ],
    ],
};
