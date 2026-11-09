import { FormFieldOption, FormSectionConfig } from '@app/core/forms/form-section.model';
import { FormArrayTableColumn } from '@app/shared/components/form-array-table/form-array-table.component';

export const OVERRIDE_MESSAGE_PRIORITY_OPTIONS: FormFieldOption[] = [
    {
        label: 'Select Message Priority',
        value: null,
    },
    {
        label: 'LOW',
        value: 'LOW',
    },
    {
        label: 'MEDIUM',
        value: 'MEDIUM',
    },
    {
        label: 'HIGH',
        value: 'HIGH',
    },
];

export const RETRY_STEP_COLUMNS: FormArrayTableColumn[] = [
    {
        header: 'Step',
        type: 'index',
        width: '20%',
    },
    {
        header: 'Attempts',
        type: 'number',
        controlName: 'attempts',
        placeholder: 'Enter attempts',
        min: 0,
        width: '35%',
    },
    {
        header: 'Delay',
        type: 'number',
        controlName: 'delay',
        placeholder: 'Enter delay in seconds',
        min: 0,
        width: '35%',
    },
];

export function buildRetryProfileGeneralSection(recoveryProfileOptions: FormFieldOption[], networkOptions: FormFieldOption[]): FormSectionConfig {
    return {
        title: 'General',
        showTitle: false,
        topMargin: false,
        columns: [
            [
                {
                    type: 'text',
                    controlName: 'name',
                    label: 'Name',
                    labelCol: 'col-sm-5',
                    inputCol: 'col-sm-7',
                },
            ],
            [
                {
                    type: 'number',
                    controlName: 'maxDueDelay',
                    label: 'Max Due Delay',
                    labelCol: 'col-sm-5',
                    inputCol: 'col-sm-7',
                },
            ],
        ],
        subsectionTitle: 'Exit Action',
        subsectionColumns: [
            [
                {
                    type: 'select',
                    controlName: 'recoveryProfileId',
                    label: 'Recovery Profile',
                    options: recoveryProfileOptions,
                    labelCol: 'col-sm-5',
                    inputCol: 'col-sm-7',
                },
            ],
            [
                {
                    type: 'select',
                    controlName: 'rerouteNetworkId',
                    label: 'Reroute Network ID',
                    options: networkOptions,
                    labelCol: 'col-sm-5',
                    inputCol: 'col-sm-7',
                },
            ],
        ],
    };
}

export function buildRetryProfileActionsSection(): FormSectionConfig {
    return {
        title: 'Actions',
        showTitle: false,
        topMargin: false,
        columns: [
            [
                {
                    type: 'text',
                    controlName: 'newSourceAddress',
                    label: 'New Source Address',
                    labelCol: 'col-sm-5',
                    inputCol: 'col-sm-7',
                },
                {
                    type: 'text',
                    controlName: 'removeSourceAddressPrefix',
                    label: 'Remove Source Address Prefix',
                    labelCol: 'col-sm-5',
                    inputCol: 'col-sm-7',
                },
                {
                    type: 'text',
                    controlName: 'addSourceAddressPrefix',
                    label: 'Add Source Address Prefix',
                    labelCol: 'col-sm-5',
                    inputCol: 'col-sm-7',
                },
                {
                    type: 'checkbox',
                    controlName: 'messagePriorityStaggeredEnabled',
                    label: 'Message Priority Staggered Enabled',
                    tooltip: 'When enabled, the message priority will be progressively reduced on each retry until it reaches the lowest priority.',
                    labelCol: 'col-sm-8',
                    inputCol: 'col-sm-4',
                },
            ],
            [
                {
                    type: 'text',
                    controlName: 'newDestinationAddress',
                    label: 'New Destination Address',
                    labelCol: 'col-sm-5',
                    inputCol: 'col-sm-7',
                },
                {
                    type: 'text',
                    controlName: 'removeDestinationAddressPrefix',
                    label: 'Remove Destination Address Prefix',
                    labelCol: 'col-sm-5',
                    inputCol: 'col-sm-7',
                },
                {
                    type: 'text',
                    controlName: 'addDestinationAddressPrefix',
                    label: 'Add Destination Address Prefix',
                    labelCol: 'col-sm-5',
                    inputCol: 'col-sm-7',
                },
                {
                    type: 'select',
                    controlName: 'overrideMessagePriority',
                    label: 'Override Message Priority',
                    options: OVERRIDE_MESSAGE_PRIORITY_OPTIONS,
                    labelCol: 'col-sm-5',
                    inputCol: 'col-sm-7',
                },
            ],
        ],
    };
}
