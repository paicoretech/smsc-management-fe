import { FormSectionConfig } from '@app/core/forms/form-section.model';

export const DIAMETER_PARAMETERS_SECTION: FormSectionConfig = {
  title: 'Parameters',
  columns: [
    [
      { type: 'checkbox', controlName: 'accept_undefined_peer', label: 'Accept Undefined Peer', labelCol: 'col-sm-6', inputCol: 'col-sm-6' },
      { type: 'checkbox', controlName: 'duplicate_protection', label: 'Duplicate Protection', labelCol: 'col-sm-6', inputCol: 'col-sm-6' },
      { type: 'number', controlName: 'duplicate_timer', label: 'Duplicate Timer', labelCol: 'col-sm-6', inputCol: 'col-sm-6' },
      { type: 'number', controlName: 'duplicate_size', label: 'Duplicate Size', labelCol: 'col-sm-6', inputCol: 'col-sm-6' },
      { type: 'checkbox', controlName: 'use_uri_as_fqdn', label: 'Use URI FQDN', labelCol: 'col-sm-6', inputCol: 'col-sm-6' },
      { type: 'number', controlName: 'queue_size', label: 'Queue Size', labelCol: 'col-sm-6', inputCol: 'col-sm-6' },
      { type: 'number', controlName: 'message_time_out', label: 'Message Timeout', labelCol: 'col-sm-6', inputCol: 'col-sm-6' },
      { type: 'number', controlName: 'stop_time_out', label: 'Stop Timeout', labelCol: 'col-sm-6', inputCol: 'col-sm-6' },
      { type: 'number', controlName: 'cea_time_out', label: 'Cea Timeout', labelCol: 'col-sm-6', inputCol: 'col-sm-6' },
      { type: 'number', controlName: 'iac_time_out', label: 'Iac Timeout', labelCol: 'col-sm-6', inputCol: 'col-sm-6' },
    ],
    [
      { type: 'number', controlName: 'dwa_time_out', label: 'Dwa Timeout', labelCol: 'col-sm-6', inputCol: 'col-sm-6' },
      { type: 'number', controlName: 'dpa_time_out', label: 'Dpa Timeout', labelCol: 'col-sm-6', inputCol: 'col-sm-6' },
      { type: 'number', controlName: 'rec_time_out', label: 'Rec Timeout', labelCol: 'col-sm-6', inputCol: 'col-sm-6' },
      { type: 'number', controlName: 'peer_fsm_thread_count', label: 'Peer FSM Thread Count', labelCol: 'col-sm-6', inputCol: 'col-sm-6' },
      { type: 'checkbox', controlName: 'single_local_peer', label: 'Single Local Peer', labelCol: 'col-sm-6', inputCol: 'col-sm-6' },
      { type: 'number', controlName: 'session_time_out', label: 'Session Timeout', labelCol: 'col-sm-6', inputCol: 'col-sm-6' },
      { type: 'number', controlName: 'bind_delay', label: 'Bind Delay', labelCol: 'col-sm-6', inputCol: 'col-sm-6' },
      { type: 'number', controlName: 'request_table_size', label: 'Request Table Size', labelCol: 'col-sm-6', inputCol: 'col-sm-6', groupErrorKey: 'clearSizeGteSize', groupErrorFields: ['request_table_size', 'request_table_clear_size'] },
      { type: 'number', controlName: 'request_table_clear_size', label: 'Request Table Clear Size', labelCol: 'col-sm-6', inputCol: 'col-sm-6', groupErrorKey: 'clearSizeGteSize', groupErrorFields: ['request_table_size', 'request_table_clear_size'], groupErrorMessage: 'Request Table Clear Size must be less than Request Table Size.' },
    ],
  ],
};
