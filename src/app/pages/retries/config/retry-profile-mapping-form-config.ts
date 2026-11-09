import { FormFieldOption, FormSectionConfig } from '@app/core/forms/form-section.model';
import { FormArrayTableColumn } from '@app/shared/components/form-array-table/form-array-table.component';

export const RETRY_MAPPING_PROTOCOL_OPTIONS: FormFieldOption[] = [
    {
        label: 'Select Protocol',
        value: null,
    },
    {
        label: 'HTTP',
        value: 'HTTP',
    },
    {
        label: 'SMPP',
        value: 'SMPP',
    },
    {
        label: 'SS7',
        value: 'SS7',
    },
    {
        label: 'SIP',
        value: 'SIP',
    },
    {
        label: 'DIAMETER',
        value: 'DIAMETER',
    },
];

export const RETRY_MAPPING_PRIORITY_OPTIONS: FormFieldOption[] = [
    {
        label: 'Select Message Priority',
        value: null,
    },
    {
        label: 'HIGH',
        value: 'HIGH',
    },
    {
        label: 'MEDIUM',
        value: 'MEDIUM',
    },
    {
        label: 'LOW',
        value: 'LOW',
    },
];

export const RETRY_PROPERTY_OPERATOR_OPTIONS: FormFieldOption[] = [
    {
        label: 'Select Operator',
        value: null,
    },
    {
        label: 'Equals',
        value: 'EQUALS',
    },
    {
        label: 'Not Equals',
        value: 'NOT_EQUALS',
    },
    {
        label: 'Regex',
        value: 'REGEX',
    },
];

export const RETRY_PROPERTY_MATCHER_TYPE_OPTIONS: FormFieldOption[] = [
    {
        label: 'Select Type',
        value: null,
    },
    {
        label: 'Custom',
        value: 'CUSTOM_PARAMETER',
    },
    {
        label: 'Message',
        value: 'MESSAGE_EVENT',
    },
];

export const RETRY_MESSAGE_EVENT_FIELD_OPTIONS: FormFieldOption[] = [
    {
        label: 'Select Message Event Field',
        value: null,
    },
    {
        label: 'Source Address',
        value: 'sourceAddr',
    },
    {
        label: 'Destination Address',
        value: 'destinationAddr',
    },
    {
        label: 'Source Address NPI',
        value: 'sourceAddrNpi',
    },
    {
        label: 'Source Address TON',
        value: 'sourceAddrTon',
    },
    {
        label: 'Destination Address TON',
        value: 'destAddrTon',
    },
    {
        label: 'Destination Address NPI',
        value: 'destAddrNpi',
    },
    {
        label: 'Short Message',
        value: 'shortMessage',
    },
];

export const RETRY_PROPERTY_MATCHER_COLUMNS: FormArrayTableColumn[] = [
    {
        header: 'Type',
        type: 'select',
        controlName: 'type',
        options: RETRY_PROPERTY_MATCHER_TYPE_OPTIONS,
        width: '20%',
    },
    {
        header: 'Field Name',
        type: 'conditional',
        controlName: 'field',
        typeControlName: 'type',
        selectWhenValue: 'MESSAGE_EVENT',
        options: RETRY_MESSAGE_EVENT_FIELD_OPTIONS,
        placeholder: 'Enter custom parameter name',
        width: '25%',
    },
    {
        header: 'Operator',
        type: 'select',
        controlName: 'operator',
        options: RETRY_PROPERTY_OPERATOR_OPTIONS,
        width: '20%',
    },
    {
        header: 'Value',
        type: 'text',
        controlName: 'value',
        placeholder: 'Enter value',
        width: '25%',
    },
];

export function buildRetryMappingProfileSection(profileOptions: FormFieldOption[]): FormSectionConfig {
    return {
        title: 'Retry Profile',
        showTitle: false,
        topMargin: false,
        columns: [
            [
                {
                    type: 'select',
                    controlName: 'retryProfileId',
                    label: 'Profile to Apply',
                    options: profileOptions,
                    labelCol: 'col-sm-5',
                    inputCol: 'col-sm-7',
                },
            ],
            [],
        ],
    };
}
