export interface Broadcast {
    broadcast_id: number;
    name: string;
    total_message: number;
    network_id: number;
    description: string;
    file_id: number;
    status: string;
    request_dlr: boolean;
    column_mapping: any;
    first_record_mapping: string;
    message_template: string;
    sender_id: string;
    start_datetime: string;
    max_execution_datetime: string;
    comment: string;
    source_addr_ton: number;
    source_addr_npi: number;
    dest_addr_ton: number;
    dest_addr_npi: number;
    data_coding: number;
    is_immediate: boolean;
    created_by_id?: number;
    created_by_username?: string;
}

export interface Statistic {
    total_message: number;
    pending: number;
    enqueue: number;
    sent: number;
    failed: number;
    duplicated: number;
    invalid: number
}
