export const DLR_STATUS_LIST = [
  'DELIVRD',
  'EXPIRED',
  'DELETED',
  'UNDELIV',
  'ACCEPTD',
  'ENROUTE',
  'REJECTD',
  'UNKNOWN',
];

export function getDlrStatus(cdr: any): string {
  if (!cdr || cdr.message_type !== 'DELIVER') {
    return '';
  }
  return (cdr.comment || '').trim();
}
