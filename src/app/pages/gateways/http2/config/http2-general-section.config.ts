import { FormFieldOption, FormSectionConfig } from "@app/core/forms/form-section.model";

export const REQUEST_DLR_OPTIONS: FormFieldOption[] = [
  { label: 'Transparent', value: 2 },
  { label: 'True', value: 1 },
  { label: 'False', value: 0 },
];

export function buildHttp2GatewayGeneralSection(isEdit: boolean, mnoOptions: FormFieldOption[]):
  FormSectionConfig {
  return {
    title: 'General',
    topMargin: false,
    columns: [
      [
        {
          type: 'number',
          controlName: 'network_id',
          label: 'Network Id',
          readonly: true,
          hidden: !isEdit,
        },
        {
          type: 'text',
          controlName: 'name',
          label: 'Gateway Name',
        },
        {
          type: 'select',
          controlName: 'mno_id',
          label: 'MNO',
          options: mnoOptions,
        },
      ],
      [
        {
          type: 'text',
          controlName: 'host',
          label: 'Host',
        },
        {
          type: 'select',
          controlName: 'request_dlr',
          label: 'Request DLR',
          options: REQUEST_DLR_OPTIONS,
        },
        {
          type: 'checkbox',
          controlName: 'split_message',
          label: 'Split Message',
          labelCol: 'col-sm-4',
          inputCol: 'col-sm-8',
        },
      ],
    ],
  };
}
