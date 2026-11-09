import { FormSectionConfig } from '@app/core/forms/form-section.model';

const priorityFields = [
  'messages_per_second_high',
  'messages_per_second_medium',
  'messages_per_second_low',
];

export const DIAMETER_GATEWAY_PERFORMANCE_SECTION: FormSectionConfig = {
  title: 'Performance & Limits',
  topMargin: true,
  columns: [
    [
      {
        type: 'number',
        controlName: 'messages_per_second_high',
        label: 'Messages Per Second - High Priority',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
        groupErrorKey: 'atLeastOnePriorityActive',
        groupErrorFields: priorityFields,
      },
      {
        type: 'number',
        controlName: 'messages_per_second_low',
        label: 'Messages Per Second - Low Priority',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
        groupErrorKey: 'atLeastOnePriorityActive',
        groupErrorFields: priorityFields,
      },
    ],
    [
      {
        type: 'number',
        controlName: 'messages_per_second_medium',
        label: 'Messages Per Second - Medium Priority',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
        groupErrorKey: 'atLeastOnePriorityActive',
        groupErrorFields: priorityFields,
        groupErrorMessage: 'At least one priority must be active.',
      },
      {
        type: 'number',
        controlName: 'tps',
        label: 'Messages Per Second (Total)',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
        readonly: true,
      },
    ],
  ],
};
