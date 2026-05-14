export interface ChargingSetting {
    id: number | null;
    network_id: number | null;
    name: string;
    connection_type: string;
    type: string;
    mno_id?: number | null;
    global_title?: string;
    messages_per_second_high?: number;
    messages_per_second_medium?: number;
    messages_per_second_low?: number;
    tps?: number;
    local_peer: LocalPeer;
    parameters: Parameters;
    peers: Peer[] | null;
    realms: Realm[] | null;
    started: boolean;
    split_message: boolean;
    hss_update_enabled: boolean;
    allowed_traffic:boolean;
}

export interface LocalPeer {
    id?: number;
    uri: string;
    realm: string;
    ip_addresses: string;
    vendor_id: number;
    product_name: string;
    firmware_version: number;
    applications: Application[];
}

export interface Application {
    id?: number;
    name: string;
    delete: boolean;
    vendor_id: number;
    auth_appl_id: number;
    acct_appl_id: number;
}

export interface Parameters {
    id?: number;
    accept_undefined_peer: boolean;
    duplicate_protection: boolean;
    duplicate_timer: number;
    duplicate_size: number;
    use_uri_as_fqdn: boolean;
    queue_size: number;
    message_time_out: number;
    stop_time_out: number;
    cea_time_out: number;
    iac_time_out: number;
    dwa_time_out: number;
    dpa_time_out: number;
    rec_time_out: number;
    peer_fsm_thread_count: number;
    single_local_peer: boolean;
    session_time_out: number;
    bind_delay: number;
    request_table_size: number;
    request_table_clear_size: number;
}

export interface Peer {
    id?: number;
    name: string;
    uri: string;
    rating: number;
    host: string;
    applications: string;
    ip: string;
    started: boolean;
    delete: boolean;
    diameter_gateway_id: number;
    attempt_connect: boolean;
    port_range: string;
    security_ref: string;
}

export interface Realm {
    id?: number;
    name: string;
    uri: string;
    peers: string;
    dynamic: boolean;
    application: Application;
    delete: boolean;
    diameter_gateway_id: number;
    local_action: string;
    exp_time: number;
}
