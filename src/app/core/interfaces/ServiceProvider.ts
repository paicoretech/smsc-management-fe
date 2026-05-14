export interface ServiceProvider {
  network_id: number;
  name: string;
  system_id: string;
  password: string;
  system_type: string;
  interface_version: string;
  sessions_number: number;
  address_ton: number;
  address_npi: number;
  address_range: string;
  balance_type: string;
  balance: number;
  tps: number;
  validity: number;
  status: string;
  enabled: number;
  enquire_link_Leriod: number;
  pdu_timeout: number;
  smpp_server_id: number;
  request_dlr: boolean;
  active_sessions_numbers: number;
  contact_name: string;
  email: string;
  phone_number: string;
  protocol: string;
  bind_type: string;
  callback_url?: string;
  authentication_types?: string;
  header_security_name?: string;
  token?: string;
  callback_headers_http?: CallBackHeader[];
  user_name?: string;
  passwd?: string;
  message_priority: string;
  custom_parameters?: string;
}

interface CallBackHeader {
  header_name: string;
  header_value: string;
}
