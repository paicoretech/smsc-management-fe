export const REPORT_NAME_MAP: Record<string, string> = {
  ALL: 'All Reports',
  SUMMARY_CDR_ACCOUNT: 'Delivery Rate by Account',
  SUMMARY_CDR_BROADCAST: 'Delivery Rate by Campaign',
  SUMMARY_CDR_DESTINATION: 'Delivery Rate by Destination (Gateways)',
  SUMMARY_CDR_ACCOUNT_TRAFFIC: 'Traffic by Account (Service Providers)',
  SUMMARY_CDR_DESTINATION_TRAFFIC: 'Traffic by Destination (Gateways)',
  SUMMARY_CDR_USER_AND_SENDER_TRAFFIC: 'Traffic by User and by Sender',
  CDRS_DETAILED_REPORT: 'Detailed Report',
};

export const REPORT_OPTIONS = Object.entries(REPORT_NAME_MAP)
  .map(([value, label]) => ({ value, label }));
