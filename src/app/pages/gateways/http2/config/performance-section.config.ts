import { FormSectionConfig } from "@app/core/forms/form-section.model";

export const PERFORMANCE_SECTION: FormSectionConfig = {
    title: 'Performance & Limits',
    topMargin: false,
    columns: [
        [
            {
                type: 'number',
                controlName: 'thread_pool_size',
                label: 'Thread Pool Size'
            },
            {
                type: 'number',
                controlName: 'messages_per_second',
                label: 'Messages Per Second (Total)'
            },
            {
                type: 'number',
                controlName: 'messages_per_second_high',
                label: 'Messages Per Second (High Priority)'
            },
        ],
        [
            {
                type: 'number',
                controlName: 'messages_per_second_medium',
                label: 'Messages Per Second (Medium Priority)'
            },
            {
                type: 'number',
                controlName: 'messages_per_second_low',
                label: 'Messages Per Second (Low Priority)'
            },
            {
                type: 'checkbox',
                controlName: 'rate_limiting_enabled',
                label: 'Enable Rate Limiting',
                labelCol: 'col-sm-4',
                inputCol: 'col-sm-8',
            },
        ],
    ],
};