import { Timezone } from '@pdc/provider-validator';
import { addDays, addMonths, startOfMonth, subDays } from 'date-fns';
import { formatInTimeZone, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

export const defaultTz = 'Europe/Paris';

export function toISOString(d: Date): string {
  try {
    return d.toISOString();
  } catch (e) {
    return d?.toString();
  }
}

export function toTzString(d: Date, tz?: Timezone): string {
  try {
    return formatInTimeZone(d, tz || defaultTz, "yyyy-MM-dd'T'HH:mm:ssXX");
  } catch (e) {
    return d?.toString();
  }
}

export function castUserStringToUTC(tz: Timezone, dates: Array<Date | string | undefined | null>): Date[] {
  const cast: Date[] = [];
  for (const d of dates) {
    if (d === null || typeof d === 'undefined') continue;

    // a JS Date doesn't need to me offset.
    // the User must set the right timezone by himself
    if (typeof d !== 'string') {
      cast.push(d);
      continue;
    }

    // a short-form date (YYYY-MM-DD) has no timezone
    // the User timezone is applied and the date is converted to UTC
    if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(d)) {
      cast.push(zonedTimeToUtc(d, tz || defaultTz));
      continue;
    }

    // a full-short date (YYYY-MM-DDTHH:mm:ssZZ) has a timezone
    // it is converted to UTC by the Date object
    const dd = new Date(d);
    if (dd.toString() === 'Invalid Date') continue;

    cast.push(dd);
  }

  return cast;
}

export function today(tz?: Timezone): Date {
  return zonedTimeToUtc(new Date().toISOString().substring(0, 11), tz || defaultTz);
}

export function addDaysTz(d: Date, days: number, tz?: Timezone): Date {
  return zonedTimeToUtc(addDays(utcToZonedTime(d, tz || defaultTz), days), tz || defaultTz);
}

export function subDaysTz(d: Date, days: number, tz?: Timezone): Date {
  return zonedTimeToUtc(subDays(utcToZonedTime(d, tz || defaultTz), days), tz || defaultTz);
}

export function addMonthsTz(d: Date, months: number, tz?: Timezone): Date {
  return zonedTimeToUtc(addMonths(utcToZonedTime(d, tz || defaultTz), months), tz || defaultTz);
}

export function startOfMonthTz(d: Date, tz?: Timezone): Date {
  return zonedTimeToUtc(startOfMonth(utcToZonedTime(d, tz || defaultTz)), tz || defaultTz);
}
