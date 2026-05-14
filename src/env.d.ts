interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  /**
   * Built-in environment variable.
   * @see Docs https://github.com/chihab/ngx-env#ng_app_env.
   */
  readonly NG_APP_API_URL: string;
  readonly NG_APP_PATTERN_IP: string;
  readonly NG_APP_MAX_LENGTH_IP: number;
  readonly NG_APP_PATTERN_EMAIL: string;
  readonly NG_APP_PATTERN_SYSTEM_ID: string;
  readonly NG_APP_PATTERN_SYSTEM_LABEL: string;

  // # TimeOut for WebSockets
  readonly NG_APP_TIMEOUT_WEBSOCKET: number;

  // # Filter Configuration
  // Set to true to show only Service Providers in Account filter (excludes Gateways)
  readonly NG_APP_FILTER_ONLY_SERVICE_PROVIDERS: boolean;
  // Set to true to show only Gateways in Destination Gateway filter (excludes Service Providers)
  readonly NG_APP_FILTER_ONLY_GATEWAYS: boolean;

  // # Variables for ServiceProviderDefaults
  readonly NG_APP_SP_BIND_TYPE: string;
  readonly NG_APP_SP_INTERFACE_VERSION: string;
  readonly NG_APP_SP_SESSIONS_NUMBER: number;
  readonly NG_APP_SP_ADDRESS_TON: number;
  readonly NG_APP_SP_ADDRESS_NPI: number;
  readonly NG_APP_SP_ADDRESS_RANGE_REGEX: string;
  readonly NG_APP_SP_BALANCE_TYPE: string;
  readonly NG_APP_SP_BALANCE: number;
  readonly NG_APP_SP_TPS: number;
  readonly NG_APP_SP_VALIDITY: number;
  readonly NG_APP_SP_STATUS: string;
  readonly NG_APP_SP_ENABLED: number;
  readonly NG_APP_SP_ENQUIRE_LINK_PERIOD: number;
  readonly NG_APP_SP_PDU_TIMEOUT: number;
  readonly NG_APP_SP_REQUEST_DLR: string;
  readonly NG_APP_SP_CONTACT_NAME: string;
  readonly NG_APP_SP_EMAIL: string;
  readonly NG_APP_SP_PHONE_NUMBER: string;
  readonly NG_APP_SP_PROTOCOL: string;
  readonly NG_APP_SP_PRIORITY: string;

  // # Variables for gateway SMPP
  readonly NG_APP_GA_BIND_TYPE: string;
  readonly NG_APP_GA_INTERFACE_VERSION: string;
  readonly NG_APP_GA_SESSIONS_NUMBER: number;
  readonly NG_APP_GA_ADDRESS_TON: number;
  readonly NG_APP_GA_ADDRESS_NPI: number;
  readonly NG_APP_GA_TPS: number;
  readonly NG_APP_GA_STATUS: string;
  readonly NG_APP_GA_ENABLED: number;
  readonly NG_APP_GA_ENQUIRE_LINK_PERIOD: number;
  readonly NG_APP_GA_BIND_TIMEOUT: number;
  readonly NG_APP_GA_BIND_RETRY_PERIOD: number;
  readonly NG_APP_GA_PDU_TIMEOUT: number;
  readonly NG_APP_GA_PDU_DEGREE: number;
  readonly NG_APP_GA_THREAD_POOL_SIZE: number;
  readonly NG_APP_GA_REQUEST_DLR: string;
  readonly NG_APP_GA_PROTOCOL: string;
  readonly NG_APP_GA_ENCODING_GSM7: number;
  readonly NG_APP_GA_ENCODING_ISO8859: number;
  readonly NG_APP_GA_ENCODING_UCS2: number;
  readonly NG_APP_GA_SPLIT_MESSAGE: string;
  readonly NG_APP_GA_SPLIT_SMPP_TYPE: string;

  // # Variables for gateway SS7
  readonly NG_APP_GA_SS7_STATUS: string;
  readonly NG_APP_GA_SS7_ENABLED: number;
  readonly NG_APP_GA_SS7_GLOBAL_TITLE: number;
  readonly NG_APP_GA_SS7_GLOBAL_TITLE_INDICATOR: number;
  readonly NG_APP_GA_SS7_TRANSLATION_TYPE: number;
  readonly NG_APP_GA_SS7_SMSC_SSN: number;
  readonly NG_APP_GA_SS7_HLR_SSN: number;
  readonly NG_APP_GA_SS7_MSC_SSN: number;
  readonly NG_APP_GA_SS7_MAP_VERSION: number;
  readonly NG_APP_GA_SS7_SPLIT_MESSAGE: string;
  readonly NG_APP_GA_SS7_HOME_ROUTING: string;
  readonly NG_APP_GA_SS7_HSS_UPDATE_ENABLED: string;
  readonly NG_APP_GA_SS7_ALLOWED_TRAFFIC: string;
  readonly NG_APP_GA_SS7_ALLOWED_USSI: string;

  // # Variables for Gateway SS7 M3UA - Sockets
  readonly NG_APP_GA_SS7_M3UA_SOCKET_TYPE: string;

  // # Variables for Gateway SS7 M3UA Settings.
  readonly NG_APP_GA_SS7_M3UA_CONNECT_DELAY: number;
  readonly NG_APP_GA_SS7_M3UA_DELIVER_MESSAGE_THREAD_COUNT: number;
  readonly NG_APP_GA_SS7_M3UA_HEARTBEAT_TIME: number;
  readonly NG_APP_GA_SS7_M3UA_ROUTING_KEY_MANAGEMENT_ENABLED: boolean;
  readonly NG_APP_GA_SS7_M3UA_USE_LOWEST_BIT_FOR_LINK: boolean;
  readonly NG_APP_GA_SS7_M3UA_CC_DELAY_THRESHOLD_1: string;
  readonly NG_APP_GA_SS7_M3UA_CC_DELAY_THRESHOLD_2: string;
  readonly NG_APP_GA_SS7_M3UA_CC_DELAY_THRESHOLD_3: string;
  readonly NG_APP_GA_SS7_M3UA_CC_DELAY_BACK_TO_NORMAL_THRESHOLD_1: number;
  readonly NG_APP_GA_SS7_M3UA_CC_DELAY_BACK_TO_NORMAL_THRESHOLD_2: number;
  readonly NG_APP_GA_SS7_M3UA_CC_DELAY_BACK_TO_NORMAL_THRESHOLD_3: number;

  // # Variables for Gateway SS7 SCCP Settings.
  readonly NG_APP_GA_SS7_SCCP_ZMARGIN: number;
  readonly NG_APP_GA_SS7_SCCP_REMOVE_SPC: boolean;
  readonly NG_APP_GA_SS7_SCCP_SST_TIMER_MIN: number
  readonly NG_APP_GA_SS7_SCCP_SST_TIMER_MAX: number
  readonly NG_APP_GA_SS7_SCCP_SST_TIMER_INCREASE_FACTOR: number
  readonly NG_APP_GA_SS7_SCCP_MAX_DATA_MESSAGE: number
  readonly NG_APP_GA_SS7_SCCP_PERIOD_OF_LOGGING: number
  readonly NG_APP_GA_SS7_SCCP_REASSEMBLY_TIMER: number
  readonly NG_APP_GA_SS7_SCCP_PREVIEW_MODE: boolean
  readonly NG_APP_GA_SS7_SCCP_SCCP_PROTOCOL_VERSION: string;
  readonly NG_APP_GA_SS7_SCCP_CONGESTION_CONTROL_TIMER_A: number;
  readonly NG_APP_GA_SS7_SCCP_CONGESTION_CONTROL_TIMER_D: number;
  readonly NG_APP_GA_SS7_SCCP_CONGESTION_CONTROL_ALGORITHM: string;
  readonly NG_APP_GA_SS7_SCCP_CONGESTION_CONTROL_OUTGOING: number;

  // # Variable for TCAP - MAP Gateway SS7

  readonly NG_APP_GA_SS7_TCAP_SSN_LIST: string;
  readonly NG_APP_GA_SS7_TCAP_PREVIEW_MODE: boolean;
  readonly NG_APP_GA_SS7_TCAP_DIALOG_TIMEOUT: number;
  readonly NG_APP_GA_SS7_TCAP_INVOKE_TIMEOUT: number;
  readonly NG_APP_GA_SS7_TCAP_DIALOG_RANGE_START: number;
  readonly NG_APP_GA_SS7_TCAP_DIALOG_RANGE_END: number;
  readonly NG_APP_GA_SS7_TCAP_MAX_DIALOGS: number;
  readonly NG_APP_GA_SS7_TCAP_DO_NOT_SEND: boolean;
  readonly NG_APP_GA_SS7_TCAP_SWAP_TCAP: boolean;
  readonly NG_APP_GA_SS7_TCAP_SLS_RANGE: string;
  readonly NG_APP_GA_SS7_TCAP_EXR_DELAY_THR1: number;
  readonly NG_APP_GA_SS7_TCAP_EXR_DELAY_THR2: number;
  readonly NG_APP_GA_SS7_TCAP_EXR_DELAY_THR3: number;
  readonly NG_APP_GA_SS7_TCAP_EXR_NORMAL_DELAY_THR1: number;
  readonly NG_APP_GA_SS7_TCAP_EXR_NORMAL_DELAY_THR2: number;
  readonly NG_APP_GA_SS7_TCAP_EXR_NORMAL_DELAY_THR3: number;
  readonly NG_APP_GA_SS7_TCAP_MEMORY_MONITOR_THR1: number;
  readonly NG_APP_GA_SS7_TCAP_MEMORY_MONITOR_THR2: number;
  readonly NG_APP_GA_SS7_TCAP_MEMORY_MONITOR_THR3: number;
  readonly NG_APP_GA_SS7_TCAP_MEM_NORMAL_DELAY_THR1: number;
  readonly NG_APP_GA_SS7_TCAP_MEM_NORMAL_DELAY_THR2: number;
  readonly NG_APP_GA_SS7_TCAP_MEM_NORMAL_DELAY_THR3: number;
  readonly NG_APP_GA_SS7_TCAP_BLOCKING_TCAP: boolean;

  readonly NG_APP_GA_SS7_MAP_SRI_SERVICE_OP_CODE: number;
  readonly NG_APP_GA_SS7_MAP_FORWARD_SM_SERVICE: number;

  // # Variables for Rules Service Provider
  readonly NG_APP_SOURCE_ADDR_TON: number;
  readonly NG_APP_SOURCE_ADDR_NPI: number;
  readonly NG_APP_DEST_ADDR_TON: number;
  readonly NG_APP_DEST_ADDR_NPI: number;


  // # Variables for General Settings
  readonly NG_APP_G_SETTINGS_ENCODING_GSM7: number;
  readonly NG_APP_G_SETTINGS_ENCODING_ISO8859: number;
  readonly NG_APP_G_SETTINGS_ENCODING_UCS2: number;
  readonly NG_APP_G_SETTINGS_MAX_PASSWORD_LENGTH: number;
  readonly NG_APP_G_SETTINGS_MAX_SYSTEM_ID_LENGTH: number;

  // # Variables for Retries
  readonly NG_APP_RETRY_MAX: number;
  readonly NG_APP_RETRY_DELAY: number;
  readonly NG_APP_RETRY_FIRST_DELAY: number;

  // # dtOptions for DataTables
  readonly NG_APP_DT_PAGE_LENGTH: number;
  readonly NG_APP_DT_LENGTH_MENU: string;
  readonly NG_APP_DT_ORDER: string;

  // # Smpp Server Listener Config
  readonly NG_APP_SMPP_SERVER_STATUS: string;
  readonly NG_APP_SMPP_SERVER_ENABLED: number;

  // # Variables for Broadcast
  readonly NG_APP_BROADCAST_ALLOWED_EXTENSIONS: string;
  //ip-sm-gw
  readonly NG_APP_ENABLE_IP_SM_GW: boolean;
  readonly NG_APP_PREMIUM_REDIRECT: string;

  [key: string]: any;
}

/*
 * Remove all the deprecated code below if you're using import.meta.env (recommended)
 */

/****************************** DEPREACTED **************************/
/**
 * @deprecated process.env usage
 * prefer using import.meta.env
 * */
// declare var process: {
//   env: {
//     NG_APP_ENV: string;
//     [key: string]: any;
//   };
// };

// If your project references @types/node directly (in you) or indirectly (as in RxJS < 7.6.0),
// you might need to use the following declaration merging.
// declare namespace NodeJS {
//   export interface ProcessEnv {
//     readonly NG_APP_ENV: string;
//     // Add your environment variables below
//   }
// }

// If you're using Angular Universal and process.env notation, you'll need to add the following to your tsconfig.server.json:
/* In your tsconfig.server.json */
// {
//   "extends": "./tsconfig.app.json",
//   ...
//   "exclude": [
//     "src/env.d.ts"
//   ]
// }

/*********************************************************************/
