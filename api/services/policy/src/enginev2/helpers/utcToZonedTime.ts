import { utcToZonedTime as utcToZonedTimeOriginal, OptionsWithTZ } from 'date-fns-tz';

const defaultTz = 'Europe/Paris';

export function utcToZonedTime(
  date: Date | string | number,
  timeZone: string = defaultTz,
  options?: OptionsWithTZ,
): Date {
  return utcToZonedTimeOriginal(date, timeZone, options);
}
