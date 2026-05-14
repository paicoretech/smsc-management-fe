export interface CreditBalance {
    system_id?: string;
    has_available_credit?: boolean;
    available_credit?: number;
    tps?: number;
    credit_sales_history?: CreditSalesHistory[];
    network_id?: number;
}
  
interface CreditSalesHistory {
    credit?: number;
    description?: string;
    created_at?: string;
    created_by?: string;
}