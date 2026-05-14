export interface Authority {
    authority: string;
}

export interface User {
    id: number;
    name: string;
    last_name: string;
    password: string;
    roles: string[];
    status: number;
    firstLogin: boolean;
    enabled: boolean;
    user_name: string;
    authorities: Authority[];
    account_locked: boolean;
    lock_time: string;
    service_providers: number[];
    all_service_providers: boolean;
    sender_ids?: string[];
}
