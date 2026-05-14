import { DateTime } from 'luxon';

export class DateTimeUtil {

  static toUtc0(date: string | Date | null | undefined): string | null {
    if (!date) return null;
    return DateTime.fromJSDate(new Date(date))
        .toUTC()                              
        .toFormat("yyyy-MM-dd'T'HH:mm:ss"); 
  }
  
  static toLocalTime(date: string | Date | null | undefined): string | null {
    if (!date) return null;
    return DateTime.fromISO(date.toString(), { zone: DateTime.local().zoneName })
      .setZone('utc')
      .toFormat('yyyy-MM-dd HH:mm:ss');
  }

  static toUtcFromLocal(date: string | Date | null | undefined): string | null {
     if (!date) return null;
    return DateTime.fromISO(date.toString(), { zone: 'utc' })
      .setZone(DateTime.local().zoneName)
      .toFormat('yyyy-MM-dd HH:mm:ss');
  }

  static toLocalDateTime(date: string | Date | null | undefined): DateTime | null {
    if (!date) return null;
    return DateTime.fromISO(date.toString(), { zone: 'utc' }).setZone(DateTime.local().zoneName);
  }

  static fromDateInputAsUtc(dateStr: string): DateTime {
    return DateTime.fromISO(dateStr, { zone: 'utc' }).startOf('day');
  }

  static fromDateInputAsUtcEndOfDay(dateStr: string): DateTime {
    return DateTime.fromISO(dateStr, { zone: 'utc' }).endOf('day');
  }
}
