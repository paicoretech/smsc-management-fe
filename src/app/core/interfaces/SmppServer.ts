export interface SmppServerConfig {
    id: number,
    name: string,
    ip: string,
    port: number,
    transaction_timer: number,
    wait_for_bind: number,
    processor_degree: number,
    queue_capacity: number,
    enabled: number,
    status: string,
    is_default: boolean,
    action_status: string,
    tls_enabled: boolean
}