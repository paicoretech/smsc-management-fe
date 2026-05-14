import {
  resolveString,
  resolveBoolean,
  resolveNumber,
  resolveCsv,
} from '@core/utils/env-resolver';

export const environment = {
  production: true,

  APIUrl: resolveString('___NG_APP_API_URL___', import.meta.env.NG_APP_API_URL),
  PremiumUrl: resolveString('___NG_APP_PREMIUM_REDIRECT___', import.meta.env.NG_APP_PREMIUM_REDIRECT),

  PatternIp: resolveString('___NG_APP_PATTERN_IP___', import.meta.env.NG_APP_PATTERN_IP),
  PatternSystemId: resolveString('___NG_APP_PATTERN_SYSTEM_ID___', import.meta.env.NG_APP_PATTERN_SYSTEM_ID),
  PatternSystemLabel: resolveString('___NG_APP_PATTERN_SYSTEM_LABEL___', import.meta.env.NG_APP_PATTERN_SYSTEM_LABEL),
  MaxLengthIp: resolveNumber('___NG_APP_MAX_LENGTH_IP___', import.meta.env.NG_APP_MAX_LENGTH_IP),
  PatternEmail: resolveString('___NG_APP_PATTERN_EMAIL___', import.meta.env.NG_APP_PATTERN_EMAIL),

  timeOutWebsocket: resolveNumber('___NG_APP_TIMEOUT_WEBSOCKET___', import.meta.env.NG_APP_TIMEOUT_WEBSOCKET),

  filterOnlyServiceProviders: resolveBoolean(
    '___NG_APP_FILTER_ONLY_SERVICE_PROVIDERS___',
    import.meta.env.NG_APP_FILTER_ONLY_SERVICE_PROVIDERS
  ),
  filterOnlyGateways: resolveBoolean(
    '___NG_APP_FILTER_ONLY_GATEWAYS___',
    import.meta.env.NG_APP_FILTER_ONLY_GATEWAYS
  ),
  logoPaicore: resolveString('___NG_APP_LOGO_PAICORE___', import.meta.env["NG_APP_LOGO_PAICORE"]),
  productPaic: resolveString('___NG_APP_PRODUCT_PAIC___', import.meta.env["NG_APP_PRODUCT_PAIC"]),

  IpSmGwModule: resolveBoolean(
    '___NG_APP_ENABLE_IP_SM_GW___',
    import.meta.env.NG_APP_ENABLE_IP_SM_GW
  ),

  ServiceProviderDefaults: {
    bind_type: resolveString('___NG_APP_SP_BIND_TYPE___', import.meta.env.NG_APP_SP_BIND_TYPE),
    interface_version: resolveString('___NG_APP_SP_INTERFACE_VERSION___', import.meta.env.NG_APP_SP_INTERFACE_VERSION),
    sessions_number: resolveNumber('___NG_APP_SP_SESSIONS_NUMBER___', import.meta.env.NG_APP_SP_SESSIONS_NUMBER),
    address_ton: resolveNumber('___NG_APP_SP_ADDRESS_TON___', import.meta.env.NG_APP_SP_ADDRESS_TON),
    address_npi: resolveNumber('___NG_APP_SP_ADDRESS_NPI___', import.meta.env.NG_APP_SP_ADDRESS_NPI),
    address_range: resolveString('___NG_APP_SP_ADDRESS_RANGE_REGEX___', import.meta.env.NG_APP_SP_ADDRESS_RANGE_REGEX),
    balance_type: resolveString('___NG_APP_SP_BALANCE_TYPE___', import.meta.env.NG_APP_SP_BALANCE_TYPE),
    balance: resolveNumber('___NG_APP_SP_BALANCE___', import.meta.env.NG_APP_SP_BALANCE),
    tps: resolveNumber('___NG_APP_SP_TPS___', import.meta.env.NG_APP_SP_TPS),
    validity: resolveNumber('___NG_APP_SP_VALIDITY___', import.meta.env.NG_APP_SP_VALIDITY),
    status: resolveString('___NG_APP_SP_STATUS___', import.meta.env.NG_APP_SP_STATUS),
    enabled: resolveNumber('___NG_APP_SP_ENABLED___', import.meta.env.NG_APP_SP_ENABLED),
    enquire_link_period: resolveNumber('___NG_APP_SP_ENQUIRE_LINK_PERIOD___', import.meta.env.NG_APP_SP_ENQUIRE_LINK_PERIOD),
    pdu_timeout: resolveNumber('___NG_APP_SP_PDU_TIMEOUT___', import.meta.env.NG_APP_SP_PDU_TIMEOUT),
    request_dlr: resolveBoolean('___NG_APP_SP_REQUEST_DLR___', import.meta.env.NG_APP_SP_REQUEST_DLR),
    contact_name: resolveString('___NG_APP_SP_CONTACT_NAME___', import.meta.env.NG_APP_SP_CONTACT_NAME),
    email: resolveString('___NG_APP_SP_EMAIL___', import.meta.env.NG_APP_SP_EMAIL),
    phone_number: resolveString('___NG_APP_SP_PHONE_NUMBER___', import.meta.env.NG_APP_SP_PHONE_NUMBER),
    protocol: resolveString('___NG_APP_SP_PROTOCOL___', import.meta.env.NG_APP_SP_PROTOCOL),
    message_priority: resolveString('___NG_APP_SP_PRIORITY___', import.meta.env.NG_APP_SP_PRIORITY)
  },

  GatewaySmppDefaults: {
    bind_type: resolveString('___NG_APP_GA_BIND_TYPE___', import.meta.env.NG_APP_GA_BIND_TYPE),
    interface_version: resolveString('___NG_APP_GA_INTERFACE_VERSION___', import.meta.env.NG_APP_GA_INTERFACE_VERSION),
    sessions_number: resolveNumber('___NG_APP_GA_SESSIONS_NUMBER___', import.meta.env.NG_APP_GA_SESSIONS_NUMBER),
    address_ton: resolveNumber('___NG_APP_GA_ADDRESS_TON___', import.meta.env.NG_APP_GA_ADDRESS_TON),
    address_npi: resolveNumber('___NG_APP_GA_ADDRESS_NPI___', import.meta.env.NG_APP_GA_ADDRESS_NPI),
    tps: resolveNumber('___NG_APP_GA_TPS___', import.meta.env.NG_APP_GA_TPS),
    status: resolveString('___NG_APP_GA_STATUS___', import.meta.env.NG_APP_GA_STATUS),
    enabled: resolveNumber('___NG_APP_GA_ENABLED___', import.meta.env.NG_APP_GA_ENABLED),
    enquire_link_period: resolveNumber('___NG_APP_GA_ENQUIRE_LINK_PERIOD___', import.meta.env.NG_APP_GA_ENQUIRE_LINK_PERIOD),
    bind_timeout: resolveNumber('___NG_APP_GA_BIND_TIMEOUT___', import.meta.env.NG_APP_GA_BIND_TIMEOUT),
    bind_retry_period: resolveNumber('___NG_APP_GA_BIND_RETRY_PERIOD___', import.meta.env.NG_APP_GA_BIND_RETRY_PERIOD),
    pdu_timeout: resolveNumber('___NG_APP_GA_PDU_TIMEOUT___', import.meta.env.NG_APP_GA_PDU_TIMEOUT),
    pdu_degree: resolveNumber('___NG_APP_GA_PDU_DEGREE___', import.meta.env.NG_APP_GA_PDU_DEGREE),
    thread_pool_size: resolveNumber('___NG_APP_GA_THREAD_POOL_SIZE___', import.meta.env.NG_APP_GA_THREAD_POOL_SIZE),
    request_dlr: resolveBoolean('___NG_APP_GA_REQUEST_DLR___', import.meta.env.NG_APP_GA_REQUEST_DLR),
    protocol: resolveString('___NG_APP_GA_PROTOCOL___', import.meta.env.NG_APP_GA_PROTOCOL),
    encoding_iso88591: resolveString('___NG_APP_GA_ENCODING_ISO8859___', import.meta.env.NG_APP_GA_ENCODING_ISO8859),
    encoding_gsm7: resolveString('___NG_APP_GA_ENCODING_GSM7___', import.meta.env.NG_APP_GA_ENCODING_GSM7),
    encoding_ucs2: resolveString('___NG_APP_GA_ENCODING_UCS2___', import.meta.env.NG_APP_GA_ENCODING_UCS2),
    split_message: resolveString('___NG_APP_GA_SPLIT_MESSAGE___', import.meta.env.NG_APP_GA_SPLIT_MESSAGE),
    split_smpp_type: resolveString('___NG_APP_GA_SPLIT_SMPP_TYPE___', import.meta.env.NG_APP_GA_SPLIT_SMPP_TYPE),
  },

  GatewaySs7Defaults: {
    status: resolveString('___NG_APP_GA_SS7_STATUS___', import.meta.env.NG_APP_GA_SS7_STATUS),
    enabled: resolveNumber('___NG_APP_GA_SS7_ENABLED___', import.meta.env.NG_APP_GA_SS7_ENABLED),

    global_title: resolveString('___NG_APP_GA_SS7_GLOBAL_TITLE___', import.meta.env.NG_APP_GA_SS7_GLOBAL_TITLE),
    global_title_indicator: resolveString('___NG_APP_GA_SS7_GLOBAL_TITLE_INDICATOR___', import.meta.env.NG_APP_GA_SS7_GLOBAL_TITLE_INDICATOR),
    translation_type: resolveString('___NG_APP_GA_SS7_TRANSLATION_TYPE___', import.meta.env.NG_APP_GA_SS7_TRANSLATION_TYPE),

    smsc_ssn: resolveNumber('___NG_APP_GA_SS7_SMSC_SSN___', import.meta.env.NG_APP_GA_SS7_SMSC_SSN),
    hlr_ssn: resolveNumber('___NG_APP_GA_SS7_HLR_SSN___', import.meta.env.NG_APP_GA_SS7_HLR_SSN),
    msc_ssn: resolveNumber('___NG_APP_GA_SS7_MSC_SSN___', import.meta.env.NG_APP_GA_SS7_MSC_SSN),

    map_version: resolveString('___NG_APP_GA_SS7_MAP_VERSION___', import.meta.env.NG_APP_GA_SS7_MAP_VERSION),
    split_message: resolveString('___NG_APP_GA_SS7_SPLIT_MESSAGE___', import.meta.env.NG_APP_GA_SS7_SPLIT_MESSAGE),
    home_routing: resolveString('___NG_APP_GA_SS7_HOME_ROUTING___', import.meta.env.NG_APP_GA_SS7_HOME_ROUTING),

    hss_update_enabled: resolveString('___NG_APP_GA_SS7_HSS_UPDATE_ENABLED___', import.meta.env.NG_APP_GA_SS7_HSS_UPDATE_ENABLED),
    allowed_traffic: resolveString('___NG_APP_GA_SS7_ALLOWED_TRAFFIC___', import.meta.env.NG_APP_GA_SS7_ALLOWED_TRAFFIC),
    allowed_ussi: resolveString('___NG_APP_GA_SS7_ALLOWED_USSI___', import.meta.env.NG_APP_GA_SS7_ALLOWED_USSI),

    tcap: {
      ssn_list: resolveString('___NG_APP_GA_SS7_TCAP_SSN_LIST___', import.meta.env.NG_APP_GA_SS7_TCAP_SSN_LIST),
      preview_mode: resolveBoolean('___NG_APP_GA_SS7_TCAP_PREVIEW_MODE___', import.meta.env.NG_APP_GA_SS7_TCAP_PREVIEW_MODE),
      invoke_timeout: resolveNumber('___NG_APP_GA_SS7_TCAP_INVOKE_TIMEOUT___', import.meta.env.NG_APP_GA_SS7_TCAP_INVOKE_TIMEOUT),
      dialog_timeout: resolveNumber('___NG_APP_GA_SS7_TCAP_DIALOG_TIMEOUT___', import.meta.env.NG_APP_GA_SS7_TCAP_DIALOG_TIMEOUT),
      dialog_range_start: resolveNumber('___NG_APP_GA_SS7_TCAP_DIALOG_RANGE_START___', import.meta.env.NG_APP_GA_SS7_TCAP_DIALOG_RANGE_START),
      dialog_range_end: resolveNumber('___NG_APP_GA_SS7_TCAP_DIALOG_RANGE_END___', import.meta.env.NG_APP_GA_SS7_TCAP_DIALOG_RANGE_END),
      max_dialogs: resolveNumber('___NG_APP_GA_SS7_TCAP_MAX_DIALOGS___', import.meta.env.NG_APP_GA_SS7_TCAP_MAX_DIALOGS),
      do_not_send: resolveBoolean('___NG_APP_GA_SS7_TCAP_DO_NOT_SEND___', import.meta.env.NG_APP_GA_SS7_TCAP_DO_NOT_SEND),
      swap_tcap: resolveBoolean('___NG_APP_GA_SS7_TCAP_SWAP_TCAP___', import.meta.env.NG_APP_GA_SS7_TCAP_SWAP_TCAP),
      sls_range: resolveString('___NG_APP_GA_SS7_TCAP_SLS_RANGE___', import.meta.env.NG_APP_GA_SS7_TCAP_SLS_RANGE),
      exr_delay_thr_1: resolveNumber('___NG_APP_GA_SS7_TCAP_EXR_DELAY_THR1___', import.meta.env.NG_APP_GA_SS7_TCAP_EXR_DELAY_THR1),
      exr_delay_thr_2: resolveNumber('___NG_APP_GA_SS7_TCAP_EXR_DELAY_THR2___', import.meta.env.NG_APP_GA_SS7_TCAP_EXR_DELAY_THR2),
      exr_delay_thr_3: resolveNumber('___NG_APP_GA_SS7_TCAP_EXR_DELAY_THR3___', import.meta.env.NG_APP_GA_SS7_TCAP_EXR_DELAY_THR3),
      exr_normal_delay_thr_1: resolveNumber('___NG_APP_GA_SS7_TCAP_EXR_NORMAL_DELAY_THR1___', import.meta.env.NG_APP_GA_SS7_TCAP_EXR_NORMAL_DELAY_THR1),
      exr_normal_delay_thr_2: resolveNumber('___NG_APP_GA_SS7_TCAP_EXR_NORMAL_DELAY_THR2___', import.meta.env.NG_APP_GA_SS7_TCAP_EXR_NORMAL_DELAY_THR2),
      exr_normal_delay_thr_3: resolveNumber('___NG_APP_GA_SS7_TCAP_EXR_NORMAL_DELAY_THR3___', import.meta.env.NG_APP_GA_SS7_TCAP_EXR_NORMAL_DELAY_THR3),
      memory_monitor_thr_1: resolveNumber('___NG_APP_GA_SS7_TCAP_MEMORY_MONITOR_THR1___', import.meta.env.NG_APP_GA_SS7_TCAP_MEMORY_MONITOR_THR1),
      memory_monitor_thr_2: resolveNumber('___NG_APP_GA_SS7_TCAP_MEMORY_MONITOR_THR2___', import.meta.env.NG_APP_GA_SS7_TCAP_MEMORY_MONITOR_THR2),
      memory_monitor_thr_3: resolveNumber('___NG_APP_GA_SS7_TCAP_MEMORY_MONITOR_THR3___', import.meta.env.NG_APP_GA_SS7_TCAP_MEMORY_MONITOR_THR3),
      mem_normal_delay_thr_1: resolveNumber('___NG_APP_GA_SS7_TCAP_MEM_NORMAL_DELAY_THR1___', import.meta.env.NG_APP_GA_SS7_TCAP_MEM_NORMAL_DELAY_THR1),
      mem_normal_delay_thr_2: resolveNumber('___NG_APP_GA_SS7_TCAP_MEM_NORMAL_DELAY_THR2___', import.meta.env.NG_APP_GA_SS7_TCAP_MEM_NORMAL_DELAY_THR2),
      mem_normal_delay_thr_3: resolveNumber('___NG_APP_GA_SS7_TCAP_MEM_NORMAL_DELAY_THR3___', import.meta.env.NG_APP_GA_SS7_TCAP_MEM_NORMAL_DELAY_THR3),
      blocking_tcap: resolveBoolean('___NG_APP_GA_SS7_TCAP_BLOCKING_TCAP___', import.meta.env.NG_APP_GA_SS7_TCAP_BLOCKING_TCAP),
    },

    map: {
      sri_service_op_code: resolveNumber('___NG_APP_GA_SS7_MAP_SRI_SERVICE_OP_CODE___',import.meta.env.NG_APP_GA_SS7_MAP_SRI_SERVICE_OP_CODE),
      forward_sm_service_op_code: resolveNumber('___NG_APP_GA_SS7_MAP_FORWARD_SM_SERVICE___',import.meta.env.NG_APP_GA_SS7_MAP_FORWARD_SM_SERVICE),
    },

    m3ua: {
      CONNECT_DELAY: resolveNumber('___NG_APP_GA_SS7_M3UA_CONNECT_DELAY___', import.meta.env.NG_APP_GA_SS7_M3UA_CONNECT_DELAY),
      DELIVER_MESSAGE_THREAD_COUNT: resolveNumber('___NG_APP_GA_SS7_M3UA_DELIVER_MESSAGE_THREAD_COUNT___', import.meta.env.NG_APP_GA_SS7_M3UA_DELIVER_MESSAGE_THREAD_COUNT),
      HEARTBEAT_TIME: resolveNumber('___NG_APP_GA_SS7_M3UA_HEARTBEAT_TIME___', import.meta.env.NG_APP_GA_SS7_M3UA_HEARTBEAT_TIME),
      ROUTING_KEY_MANAGEMENT_ENABLED: resolveBoolean('___NG_APP_GA_SS7_M3UA_ROUTING_KEY_MANAGEMENT_ENABLED___', import.meta.env.NG_APP_GA_SS7_M3UA_ROUTING_KEY_MANAGEMENT_ENABLED),
      USE_LOWEST_BIT_FOR_LINK: resolveBoolean('___NG_APP_GA_SS7_M3UA_USE_LOWEST_BIT_FOR_LINK___', import.meta.env.NG_APP_GA_SS7_M3UA_USE_LOWEST_BIT_FOR_LINK),
      CC_DELAY_THRESHOLD_1: resolveNumber('___NG_APP_GA_SS7_M3UA_CC_DELAY_THRESHOLD_1___', import.meta.env.NG_APP_GA_SS7_M3UA_CC_DELAY_THRESHOLD_1),
      CC_DELAY_THRESHOLD_2: resolveNumber('___NG_APP_GA_SS7_M3UA_CC_DELAY_THRESHOLD_2___', import.meta.env.NG_APP_GA_SS7_M3UA_CC_DELAY_THRESHOLD_2),
      CC_DELAY_THRESHOLD_3: resolveNumber('___NG_APP_GA_SS7_M3UA_CC_DELAY_THRESHOLD_3___', import.meta.env.NG_APP_GA_SS7_M3UA_CC_DELAY_THRESHOLD_3),
      CC_DELAY_BACK_TO_NORMAL_THRESHOLD_1: resolveNumber('___NG_APP_GA_SS7_M3UA_CC_DELAY_BACK_TO_NORMAL_THRESHOLD_1___', import.meta.env.NG_APP_GA_SS7_M3UA_CC_DELAY_BACK_TO_NORMAL_THRESHOLD_1),
      CC_DELAY_BACK_TO_NORMAL_THRESHOLD_2: resolveNumber('___NG_APP_GA_SS7_M3UA_CC_DELAY_BACK_TO_NORMAL_THRESHOLD_2___', import.meta.env.NG_APP_GA_SS7_M3UA_CC_DELAY_BACK_TO_NORMAL_THRESHOLD_2),
      CC_DELAY_BACK_TO_NORMAL_THRESHOLD_3: resolveNumber('___NG_APP_GA_SS7_M3UA_CC_DELAY_BACK_TO_NORMAL_THRESHOLD_3___', import.meta.env.NG_APP_GA_SS7_M3UA_CC_DELAY_BACK_TO_NORMAL_THRESHOLD_3),
      sockets: {
        socket_type: resolveString('___NG_APP_GA_SS7_M3UA_SOCKET_TYPE___', import.meta.env.NG_APP_GA_SS7_M3UA_SOCKET_TYPE),
      },
    },

    sccp: {
      zmarin: resolveNumber('___NG_APP_GA_SS7_SCCP_ZMARGIN___', import.meta.env.NG_APP_GA_SS7_SCCP_ZMARGIN),
      remove_spc: resolveBoolean('___NG_APP_GA_SS7_SCCP_REMOVE_SPC___', import.meta.env.NG_APP_GA_SS7_SCCP_REMOVE_SPC),
      sst_timer_min: resolveNumber('___NG_APP_GA_SS7_SCCP_SST_TIMER_MIN___', import.meta.env.NG_APP_GA_SS7_SCCP_SST_TIMER_MIN),
      sst_timer_max: resolveNumber('___NG_APP_GA_SS7_SCCP_SST_TIMER_MAX___', import.meta.env.NG_APP_GA_SS7_SCCP_SST_TIMER_MAX),
      sst_timer_increase_factor: resolveNumber('___NG_APP_GA_SS7_SCCP_SST_TIMER_INCREASE_FACTOR___', import.meta.env.NG_APP_GA_SS7_SCCP_SST_TIMER_INCREASE_FACTOR),
      max_data_message: resolveNumber('___NG_APP_GA_SS7_SCCP_MAX_DATA_MESSAGE___', import.meta.env.NG_APP_GA_SS7_SCCP_MAX_DATA_MESSAGE),
      period_of_logging: resolveNumber('___NG_APP_GA_SS7_SCCP_PERIOD_OF_LOGGING___', import.meta.env.NG_APP_GA_SS7_SCCP_PERIOD_OF_LOGGING),
      reassembly_timer: resolveNumber('___NG_APP_GA_SS7_SCCP_REASSEMBLY_TIMER___', import.meta.env.NG_APP_GA_SS7_SCCP_REASSEMBLY_TIMER),
      preview_mode: resolveBoolean('___NG_APP_GA_SS7_SCCP_PREVIEW_MODE___', import.meta.env.NG_APP_GA_SS7_SCCP_PREVIEW_MODE),
      sccp_protocol_version: resolveString('___NG_APP_GA_SS7_SCCP_SCCP_PROTOCOL_VERSION___', import.meta.env.NG_APP_GA_SS7_SCCP_SCCP_PROTOCOL_VERSION),
      congestion_control_timer_a: resolveNumber('___NG_APP_GA_SS7_SCCP_CONGESTION_CONTROL_TIMER_A___', import.meta.env.NG_APP_GA_SS7_SCCP_CONGESTION_CONTROL_TIMER_A),
      congestion_control_timer_d: resolveNumber('___NG_APP_GA_SS7_SCCP_CONGESTION_CONTROL_TIMER_D___', import.meta.env.NG_APP_GA_SS7_SCCP_CONGESTION_CONTROL_TIMER_D),
      congestion_control_algorithm: resolveString('___NG_APP_GA_SS7_SCCP_CONGESTION_CONTROL_ALGORITHM___', import.meta.env.NG_APP_GA_SS7_SCCP_CONGESTION_CONTROL_ALGORITHM),
      congestion_control_outgoing: resolveBoolean('___NG_APP_GA_SS7_SCCP_CONGESTION_CONTROL_OUTGOING___', import.meta.env.NG_APP_GA_SS7_SCCP_CONGESTION_CONTROL_OUTGOING),
    },
  },

  RulesServiceProviderDefaults: {
    source_addr_ton: resolveNumber('___NG_APP_SOURCE_ADDR_TON___', import.meta.env.NG_APP_SOURCE_ADDR_TON),
    source_addr_npi: resolveNumber('___NG_APP_SOURCE_ADDR_NPI___', import.meta.env.NG_APP_SOURCE_ADDR_NPI),
    dest_addr_ton: resolveNumber('___NG_APP_DEST_ADDR_TON___', import.meta.env.NG_APP_DEST_ADDR_TON),
    dest_addr_npi: resolveNumber('___NG_APP_DEST_ADDR_NPI___', import.meta.env.NG_APP_DEST_ADDR_NPI),
  },

  generalSettings: {
    general: {
      encoding_iso88591: resolveNumber('___NG_APP_G_SETTINGS_ENCODING_ISO8859___', import.meta.env.NG_APP_G_SETTINGS_ENCODING_ISO8859),
      encoding_gsm7: resolveNumber('___NG_APP_G_SETTINGS_ENCODING_GSM7___', import.meta.env.NG_APP_G_SETTINGS_ENCODING_GSM7),
      encoding_ucs2: resolveNumber('___NG_APP_G_SETTINGS_ENCODING_UCS2___', import.meta.env.NG_APP_G_SETTINGS_ENCODING_UCS2),
      max_password_length: resolveNumber('___NG_APP_G_SETTINGS_MAX_PASSWORD_LENGTH___', import.meta.env.NG_APP_G_SETTINGS_MAX_PASSWORD_LENGTH),
      max_system_id_length: resolveNumber('___NG_APP_G_SETTINGS_MAX_SYSTEM_ID_LENGTH___', import.meta.env.NG_APP_G_SETTINGS_MAX_SYSTEM_ID_LENGTH),
    },
    retries: {
      firstRetryDelay: resolveNumber('___NG_APP_RETRY_FIRST_DELAY___', import.meta.env.NG_APP_RETRY_FIRST_DELAY),
      maxDueDelay: resolveNumber('___NG_APP_RETRY_MAX___', import.meta.env.NG_APP_RETRY_MAX),
      retryDelayMultiplier: resolveNumber('___NG_APP_RETRY_DELAY___', import.meta.env.NG_APP_RETRY_DELAY),
    },
  },

  dtOptions: {
    pagingType: 'simple_numbers',

    pageLength: resolveNumber('___NG_APP_DT_PAGE_LENGTH___', import.meta.env.NG_APP_DT_PAGE_LENGTH, 10),

    lengthMenu: resolveCsv('___NG_APP_DT_LENGTH_MENU___', import.meta.env.NG_APP_DT_LENGTH_MENU),

    scrollX: false,
    autoWidth: true,
    destroy: true,
    responsive: true,
    searching: true,
    info: true,

    order: [[0, resolveString('___NG_APP_DT_ORDER___', import.meta.env.NG_APP_DT_ORDER, 'asc')]],

    columnDefs: [{ targets: '_all', className: 'dt-nowrap' }],
  },

  smppServerListenerConfig: {
    status: resolveString('___NG_APP_SMPP_SERVER_STATUS___', import.meta.env.NG_APP_SMPP_SERVER_STATUS),
    enabled: resolveNumber('___NG_APP_SMPP_SERVER_ENABLED___', import.meta.env.NG_APP_SMPP_SERVER_ENABLED),
  },

  broadcastAllowedExtensions: resolveString(
    '___NG_APP_BROADCAST_ALLOWED_EXTENSIONS___',
    import.meta.env.NG_APP_BROADCAST_ALLOWED_EXTENSIONS
  ),
};
