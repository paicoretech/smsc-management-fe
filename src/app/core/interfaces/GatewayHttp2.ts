export interface Http2GatewayIncomingSecurity {
    oauth2_enabled: boolean;
    expected_issuer: string | null;
    require_mtls: boolean;
    ca_certificate_path: string | null;
    expected_amf_certificate_path: string | null;
    server_certificate_path: string | null;
    server_private_key_path: string | null;
}

export interface Http2GatewayNrfSecurity {
    api_root: string | null;
    secret_path: string | null;
    token_path: string | null;
    nrf_register_path: string | null;
    mtls_enabled: boolean;
    client_certificate_path: string | null;
    client_private_key_path: string | null;
    truststore_ca_path: string | null;
}

export type OutboundTokenSource = 'NRF' | 'EXTERNAL';

export interface Http2GatewayOutboundSecurity {
    oauth2_enabled: boolean;
    using_nrf: boolean;
    using_external_endpoint: boolean;
    token_source?: OutboundTokenSource | null;
    token_endpoint: string | null;
    client_id: string | null;
    client_secret: string | null;
    scope: string | null;
    mtls_enabled: boolean;
    client_certificate_path: string | null;
    client_private_key_path: string | null;
    truststore_ca_path: string | null;
}

export interface Http2GatewayUDMSecurity {
    forward_registration_enabled: boolean;
    nrf_discovery_enabled: boolean;
    api_root: string | null;
    registration_path: string | null;
    deregistration_path: string | null;
    subscriber_query_path: string | null;
    mtls_enabled: boolean;
    client_certificate_path: string | null;
    client_private_key_path: string | null;
    truststore_ca_path: string | null;
    oauth2_enabled: boolean;
    authorization_header: string | null;
    ss7_network_id: number | null;
    smsf_map_address: string | null;
    diameter_network_id: number | null;
    smsf_diameter_address: string | null;
}

export interface GatewayHttp2 {
    network_id: number | null;
    nf_instance_id?: string | null;
    name: string;
    external_id?: string | null;
    status: string;
    protocol: string;
    host: string;
    mno_id: number | null;
    enabled: number;
    multipart_parsing_enabled: boolean;
    binary_sms_enabled: boolean;
    max_message_size: number;
    default_data_coding_id: number | null;
    default_data_coding_name?: string;
    request_timeout_ms: number;
    connection_timeout_ms: number;
    idle_timeout_ms: number;
    max_response_time_ms: number;
    thread_pool_size: number;
    messages_per_second: number;
    messages_per_second_high: number;
    messages_per_second_medium: number;
    messages_per_second_low: number;
    rate_limiting_enabled: boolean;
    request_dlr: number;
    split_message: boolean;
    no_retry_error_code?: string | null;
    auto_retry_error_code?: string | null;
    retry_alternate_destination_error_code?: string | null;
    incoming_security: Http2GatewayIncomingSecurity;
    nrf_security: Http2GatewayNrfSecurity;
    outbound_security: Http2GatewayOutboundSecurity;
    udm_security: Http2GatewayUDMSecurity;
}
