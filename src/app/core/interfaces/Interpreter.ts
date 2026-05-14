export interface Interpreter {
    id: number;
    event_type: string;
    direction: string;
    body_type: string;
    template: string;
    gateway_id: number;
    gateway_name: string;
    use_proxy: boolean;
    path: string;
    default_template: boolean;
}

export interface InterpreterHttpGateways {
    network_id: number;
    name: string;
}