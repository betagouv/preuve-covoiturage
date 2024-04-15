import { Timezone } from '@pdc/providers/validator';
import { addDays, addMonths, startOfMonth, subDays, subMonths } from 'date-fns';
import { formatInTimeZone, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

export const defaultTz: Timezone = 'Europe/Paris';

/**
 * Regular UTC toISOString.
 *
 * The same as native toISOString but safer.
 */
export function toISOString(d: Date): string {
  try {
    return d.toISOString();
  } catch (e) {
    return d?.toString();
  }
}

/**
 * Convert a Date to a string in the User timezone
 *
 * Default string format is yyyy-MM-dd'T'HH:mm:ssXX
 */
export function toTzString(d: Date | string | number, tz = defaultTz, format = "yyyy-MM-dd'T'HH:mm:ssXX"): string {
  try {
    return formatInTimeZone(d, tz, format);
  } catch (e) {
    return d?.toString();
  }
}

/**
 * Cast a string formatted date to UTC.
 *
 * The string date is considered being local unless otherwise stated
 * by the time zone suffix in the full form.
 */
export function castUserStringToUTC(d: Date | string | undefined | null, tz = defaultTz): Date | undefined {
  if (d === null || typeof d === 'undefined') return;

  // a JS Date doesn't need to be offset.
  // the User must set the right timezone by himself
  if (typeof d !== 'string') {
    return d;
  }

  // a short-form date (YYYY-MM-DD) has no timezone
  // the User timezone is applied and the date is converted to UTC
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(d)) {
    return zonedTimeToUtc(d, tz);
  }

  // a full-short date (YYYY-MM-DDTHH:mm:ssZZ) has a timezone
  // it is converted to UTC by the Date object
  const dd = new Date(d);
  if (dd.toString() === 'Invalid Date') return;

  return dd;
}

/**
 * Force a Date to be considered as local
 */
export function dateWithTz(date: Date, tz = defaultTz): Date {
  return zonedTimeToUtc(toISOString(date).substring(0, 11), tz);
}

/**
 * Local today
 */
export function today(tz = defaultTz): Date {
  return dateWithTz(new Date(), tz);
}

/**
 * Local add days
 */
export function addDaysTz(d: Date, days: number, tz = defaultTz): Date {
  return zonedTimeToUtc(addDays(utcToZonedTime(d, tz), days), tz);
}

/**
 * Local sub days
 */
export function subDaysTz(d: Date, days: number, tz = defaultTz): Date {
  return zonedTimeToUtc(subDays(utcToZonedTime(d, tz), days), tz);
}

/**
 * Local add months
 */
export function addMonthsTz(d: Date, months: number, tz = defaultTz): Date {
  return zonedTimeToUtc(addMonths(utcToZonedTime(d, tz), months), tz);
}

/**
 * Local sub months
 */
export function subMonthsTz(d: Date, months: number, tz = defaultTz): Date {
  return zonedTimeToUtc(subMonths(utcToZonedTime(d, tz), months), tz);
}

/**
 * Local start of the month
 */
export function startOfMonthTz(d: Date, tz = defaultTz): Date {
  return zonedTimeToUtc(startOfMonth(utcToZonedTime(d, tz)), tz);
}
