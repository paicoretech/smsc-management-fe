export interface M3uaGeneralSettings {
    id:number
    connect_delay: number;
    max_sequence_number: number;
    max_for_route: number;
    thread_count: number;
    routing_label_format: string;
    heart_beat_time: number;
}

export interface M3uaAssociationSocket {
    id: number;
    name: string;
    state: string;
    transport_type: string;
    host_address: string;
    extra_address: string;
    host_port: number;
    socket_type: string;
    enabled: number;
}

export interface M3uaAssociation {
    id: number;
    name: string;
    state: string;
    peer: string;
    peer_port: number;
    m3ua_heartbeat:boolean;
    m3ua_socket_id?: number;
    m3ua_socket_name?: string;
    enabled: number;
}

export interface M3uaAspFactory {
    id: number;
    name: string;
    sctp_association: string;
    state: string;
}

export interface M3uaApplicationServer {
    id: number;
    name: string;
    state: string;
    exchange: string;
    functionality: string;
    routing_context: number;
    network_appearance: number;
    traffic_mode: string;
    minuimum_asp_for_loadshare: number;
}

export interface M3uaRoute {
    id: number;
    origination_point_code: number;
    destination_point_code: number;
    service_indicator: number;
    traffic_mode: string;
    traffic_mode_id: number;
    traffic_mode_name?: string;
    application_server: number;
    app_servers: number[];
}

export interface M3uaInterface {
    general: M3uaGeneralSettings;
    associations: {
      servers: M3uaAssociationSocket[];
      associations: M3uaAssociation[];
      asp_factories: M3uaAspFactory[];
    };
    application_servers: M3uaApplicationServer[];
    routes: M3uaRoute[];
}

export interface SccpGeneralSettings {
    id?: number;
    network_id: number;
    z_margin_xudt_message: number;
    remove_spc: boolean;
    sst_timer_duration_min: number;
    sst_timer_duration_max: number;
    sst_timer_duration_increase_factor: number;
    max_data_message: number;
    period_of_logging: number;
    reassembly_timer_delay: number;
    preview_mode: boolean;
    sccp_protocol_version: string;
    congestion_control_timer_a: number;
    congestion_control_timer_d: number;
    congestion_control_algorithm: string;
    congestion_control: string;
    rsp_prohibited_by_default: boolean;
}

export interface SccpRemoteResource {
  id?: number;
  ss7_sccp_id?: number;
  remote_spc?: number;
  remote_ssn?: number;
  remote_spc_status?: string;
  remote_ssn_status?: string;
  remote_sccp_status?: string;
  mark_prohibited?: boolean;
}

export interface SccpRemoteSignaling {
    id: number;
    remote_spc: number;
    remote_spc_status: string;
    remote_sccp_status: string;
}

export interface SccpRemoteSubsystem {
    id: number;
    remote_spc: number;
    remote_ssn: number;
    remote_ssn_status: string;
    mark_prohibited: boolean;
}

export interface SccpServiceAccessPoint {
    id?: number;
    ss7_sccp_id?: number;
    name: string;
    origin_point_code: number;
    network_indicator: number;
    local_gt_digits: null;
}

export interface SccpMtp3Destination {
    id?: number;
    name: string;
    sccp_sap_id: number;
    sccp_sap_name?: string;
    first_point_code: number;
    last_point_code: number;
    first_sls: number;
    last_sls: number;
    sls_mask: number;
}

export interface SccpLongMessageRule {
    id?: number;
    first_point_code: number;
    last_point_code: number;
    long_message_rule_type: string;
    sccp_sap_id: number;
}

export interface SccpAddress {
    id?: number;
    ss7_sccp_id?: number;
    name: string;
    address_indicator: number;
    point_code: number;
    subsystem_number: number;
    translation_type: number;
    gt_indicator: string;
    numbering_plan_id: number;
    numbering_plan_name?: string;
    nature_of_address_id: number;
    nature_of_address_name?: string;
    digits: string;
}

export interface SccpRule {
    id?: number|undefined|null;
    sccp_sap_id?: number;
    name?: string;
    mask?: string;
    address_indicator?: number;
    point_code?: number;
    subsystem_number?: number;
    gt_indicator?: string|undefined;
    translation_type?: number;
    numbering_plan_id?: number;
    numbering_plan_name?: string;
    nature_of_address_id?: number;
    nature_of_address_name?: string;
    global_tittle_digits?: string;
    rule_type_id?: number;
    rule_type_name?: string;
    primary_address_id?: number;
    primary_address_name?: string;
    secondary_address_id?: number;
    secondary_address_name?: string;
    load_sharing_algorithm_id?: number;
    load_sharing_algorithm_name?: string;
    new_calling_party_address?: string;
    origination_type_id?: number;
    origination_type_name?: string;
    calling_address_indicator?: number;
    calling_point_code?: number;
    calling_subsystem_number?: number;
    calling_translator_type?: number;
    calling_numbering_plan_id?: number;
    calling_numbering_plan_name?: string
    calling_nature_of_address_id?: number;
    calling_nature_of_address_name?: string;
    calling_global_tittle_digits?: string;
}

export interface SccpInterface {
    general: SccpGeneralSettings;
    resources: {
      remote_signaling: SccpRemoteSignaling[];
      remote_subsystem: SccpRemoteSubsystem[];
    };
    service_access_points: {
      service_access: SccpServiceAccessPoint[];
      mtp3_destinations: SccpMtp3Destination[];
      long_message_rules: SccpLongMessageRule[];
    };
    addresses: SccpAddress[];
    rules: SccpRule[];
}

export interface TcapInterface {
    network_id?: number,
    ssn_list: string;
    preview_mode: boolean;
    dialog_idle_timeout: number;
    invoke_timeout: number;
    dialog_id_range_start: number;
    dialog_id_range_end: number;
    max_dialogs: number;
    do_not_send_protocol_version: boolean;
    swap_tcap_id_enabled: boolean;
    sls_range?: string;
    sls_range_id?: string,
    exr_delay_thr1: number;
    exr_delay_thr2: number;
    exr_delay_thr3: number;
    exr_back_to_normal_delay_thr1: number;
    exr_back_to_normal_delay_thr2: number;
    exr_back_to_normal_delay_thr3: number;
    memory_monitor_thr1: number;
    memory_monitor_thr2: number;
    memory_monitor_thr3: number;
    mem_back_to_normal_delay_thr1: number;
    mem_back_to_normal_delay_thr2: number;
    mem_back_to_normal_delay_thr3: number;
    blocking_incoming_tcap_messages: boolean;
}

export interface MapInterface {
    network_id?: number,
    sri_service_op_code: number;
    forward_sm_service_op_code: number;
}

export enum HrMode {
  TRANSPARENT = 'TRANSPARENT',
  NON_TRANSPARENT = 'NON_TRANSPARENT',
}

export interface HomeRouting {
  id: number;
  network_id: number;
  mode: HrMode;
  ttl_cache: number;
}

export interface HomeRoutingCcMccMnc {
  id: number;
  country_code: string;
  mcc_mnc: string;
  smsc: string;
  ss7_home_routing_id: number;
}

export interface GatewaySs7 {
    network_id: number;
    name: string;
    enabled: number;
    status: string;
    mno_id: number;
    messages_per_second_high: number;
    messages_per_second_medium: number;
    messages_per_second_low: number;
    messages_per_second: number;
    global_title: string;
    global_title_indicator: string;
    translation_type: number;
    smsc_ssn: number;
    hlr_ssn: number;
    msc_ssn: number;
    map_version: number;
    split_message: boolean;
    home_routing: boolean;
    allowed_traffic:boolean;
    hss_updated_enabled:boolean;
    allowed_ussi:boolean;
    api_enabled: boolean;
    app_token?: string;
}
