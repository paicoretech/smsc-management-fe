export interface TotalI {
    title: string,
    total: string,
    icon: string,
}

export interface UserSmsSummaryI {
    user: string,
    received: string,
    sent_dlr: string,
    dlr_tps: string,
}

export interface RouteSummaryI {
    route: string,
    submitted: string,
    tps: string,
    failed: string,
}