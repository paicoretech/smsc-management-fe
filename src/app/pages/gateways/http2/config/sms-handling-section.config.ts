import { FormFieldOption, FormSectionConfig } from "@app/core/forms/form-section.model";

export function buildSmsHandlingSection(isEdit: boolean, encodingOptions: FormFieldOption[]):
    FormSectionConfig {
    return {
        title: 'SMS Handling',
        topMargin: false,
        columns: [
            [
                {
                    type: 'checkbox',
                    controlName: 'multipart_parsing_enabled',
                    label: 'Enable Multipart Parsing',
                    labelCol: 'col-sm-4',
                    inputCol: 'col-sm-8',
                },
                {
                    type: 'checkbox',
                    controlName: 'binary_sms_enabled',
                    label: 'Enable Binary SMS',
                    labelCol: 'col-sm-4',
                    inputCol: 'col-sm-8',
                },
                {
                    type: 'number',
                    controlName: 'max_message_size',
                    label: 'Max SMS Size (bytes)',
                },
            ],
            [
                {
                    type: 'select',
                    controlName: 'default_data_coding_id',
                    label: 'Default Data Coding Scheme',
                    options: encodingOptions,
                },
            ],
        ],
    };
}
