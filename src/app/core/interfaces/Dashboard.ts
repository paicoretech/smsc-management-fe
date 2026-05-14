export interface SmsStats {
  date: string;
  sms_delivery: number;
  sms_failed: number;
  total: number;
}

export interface DashboardData {
  total: number;
  data: SmsStats[];
  sms_failed: number;
  sms_delivery: number;
  sms_failed_rate: number;
  sms_delivery_rate: number;
}