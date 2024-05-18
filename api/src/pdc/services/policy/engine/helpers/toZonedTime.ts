import { toZonedTime as toZonedTimeOriginal, FormatOptionsWithTZ } from 'date-fns-tz';

const defaultTz = 'Europe/Paris';

export function toZonedTime(
  date: Date | string | number,
  timeZone: string = defaultTz,
  options?: FormatOptionsWithTZ,
): Date {
  return toZonedTimeOriginal(date, timeZone, options);
}
