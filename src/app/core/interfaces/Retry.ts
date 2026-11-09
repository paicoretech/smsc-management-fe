export type RetryProfileId = number;

export type OverrideMessagePriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RetryConfiguration {
    firstRetryDelay: number;
    maxDueDelay: number;
    retryDelayMultiplier: number;
}

export interface Retries extends RetryConfiguration {
    id: number;
}

export interface RetryStep {
    id?: number;
    profile_id?: number;
    step_number: number;
    attempts: number;
    delay_seconds: number;
}

export interface RetryProfileSummary {
    id: RetryProfileId;
    name: string;
    profile_type: string;
    steps: RetryStep[];
    action: RetryProfileAction | null;
}

export interface RetryProfileAction {
    id?: number;
    profile_id?: number;
    new_source_address: string | null;
    new_destination_address: string | null;
    remove_source_address_prefix: string | null;
    add_source_address_prefix: string | null;
    remove_destination_address_prefix: string | null;
    add_destination_address_prefix: string | null;
    message_priority_staggered_enabled: boolean;
    override_message_priority: OverrideMessagePriority | null;
}

export interface RetryProfileDetail {
    id: RetryProfileId;
    name: string;
    recovery_profile_id: RetryProfileId | null;
    reroute_network_id: number | null;
    max_due_delay_seconds: number;
    period_r_seconds: number | null;
    profile_type: string;
    steps: RetryStep[];
    action: RetryProfileAction | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface RetryProfilePayload {
    name: string;
    recovery_profile_id: RetryProfileId | null;
    reroute_network_id: number | null;
    max_due_delay_seconds: number;
    period_r_seconds: number | null;
    steps: RetryStep[];
    action: RetryProfileAction;
}

export type RetryMappingProtocol = 'HTTP' | 'SMPP' | 'SS7' | 'SIP' | 'DIAMETER';

export type RetryMappingMessagePriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type RetryMappingConditionType = 'CUSTOM_PARAMETER' | 'MESSAGE_EVENT';

export interface RetryMappingCondition {
    id?: number;
    gateway_retry_profile_id?: number;
    type: RetryMappingConditionType;
    field: string;
    operator: string;
    value: string;
}

export interface RetryProfileMapping {
    id: number;
    origin_network_id: number | null;
    destination_network_id: number | null;
    error_code: string;
    profile_id: RetryProfileId;
    message_priority: RetryMappingMessagePriority | null;
    origin_protocol: RetryMappingProtocol | null;
    destination_protocol: RetryMappingProtocol | null;
    source_address: string | null;
    destination_address: string | null;
    retry_mapping_conditions: RetryMappingCondition[];
}

export interface RetryProfileMappingPayload {
    origin_network_id: number | null;
    destination_network_id: number | null;
    error_code: string;
    profile_id: RetryProfileId;
    message_priority: RetryMappingMessagePriority | null;
    origin_protocol: RetryMappingProtocol | null;
    destination_protocol: RetryMappingProtocol | null;
    source_address: string | null;
    destination_address: string | null;
    retry_mapping_conditions: RetryMappingCondition[];
}
