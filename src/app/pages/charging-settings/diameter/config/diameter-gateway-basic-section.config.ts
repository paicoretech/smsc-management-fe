import { FormSectionConfig } from '@app/core/forms/form-section.model';
import { Mno } from '@app/core';

export function buildDiameterGatewayBasicSection(
  isCrudComponent: boolean,
  mnoList: Mno[],
  showHssUpdate: boolean,
  showAllowedTraffic: boolean,
): FormSectionConfig {
  return {
    title: 'Basic Settings',
    showTitle: false,
    columns: [
      [
        {
          type: 'text',
          controlName: 'name',
          label: 'Name',
          labelCol: 'col-sm-6',
          inputCol: 'col-sm-6',
        },
        {
          type: 'select',
          controlName: 'connection_type',
          label: 'Connection Type',
          labelCol: 'col-sm-6',
          inputCol: 'col-sm-6',
          options: [
            { label: 'SCTP', value: 'SCTP' },
            { label: 'TCP', value: 'TCP' },
          ],
        },
        {
          type: 'checkbox',
          controlName: 'split_message',
          label: 'Split Message',
          labelCol: 'col-sm-6',
          inputCol: 'col-sm-6',
          hidden: !isCrudComponent,
        },
      ],
      [
        {
          type: 'select',
          controlName: 'mno_id',
          label: 'MNOs',
          labelCol: 'col-sm-6',
          inputCol: 'col-sm-6',
          options: mnoList.map((mno) => ({ label: mno.name, value: mno.id })),
          hidden: !isCrudComponent,
        },
        {
          type: 'text',
          controlName: 'global_title',
          label: 'Global Title',
          labelCol: 'col-sm-6',
          inputCol: 'col-sm-6',
          hidden: !isCrudComponent,
        },
        {
          type: 'checkbox',
          controlName: 'hss_update_enabled',
          label: 'Allowed Registration Traffic',
          labelCol: 'col-sm-6',
          inputCol: 'col-sm-6',
          hidden: !isCrudComponent || !showHssUpdate,
        },
        {
          type: 'checkbox',
          controlName: 'allowed_traffic',
          label: 'Allowed Traffic',
          labelCol: 'col-sm-6',
          inputCol: 'col-sm-6',
          hidden: !isCrudComponent || !showAllowedTraffic,
        },
      ],
    ],
  };
}
