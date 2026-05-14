export interface GeneralSetting {
    id: string,
    validity_period: string,
    max_validity_period: string,
    source_addr_ton: string,
    source_addr_npi: string,
    dest_addr_ton: string,
    dest_addr_npi: string,
    encoding_gsm7: string,
    encoding_ucs2: string,
    encoding_iso88591: string
}

export interface SmscSetting {
    max_password_length: number,
    max_system_id_length: number,
    use_local_charging: boolean,
    use_analyze: boolean,
    use_dnd_filtering: boolean,
}

export interface HttpServerConfig {
    name: string,
    ip: string,
    port: string,
    protocol: string,
    state: string
}

export interface Retries {
    id: number,
    firstRetryDelay: number,
    maxDueDelay: number,
    retryDelayMultiplier: number,
}
