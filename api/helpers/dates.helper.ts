import { Timezone } from '@pdc/provider-validator';
import { addDays, addMonths, startOfMonth, subDays, subMonths } from 'date-fns';
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

export function castUserStringToUTC(d: Date | string | undefined | null, tz?: Timezone): Date | undefined {
  if (d === null || typeof d === 'undefined') return;

  // a JS Date doesn't need to be offset.
  // the User must set the right timezone by himself
  if (typeof d !== 'string') {
    return d;
  }

  // a short-form date (YYYY-MM-DD) has no timezone
  // the User timezone is applied and the date is converted to UTC
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(d)) {
    return zonedTimeToUtc(d, tz || defaultTz);
  }

  // a full-short date (YYYY-MM-DDTHH:mm:ssZZ) has a timezone
  // it is converted to UTC by the Date object
  const dd = new Date(d);
  if (dd.toString() === 'Invalid Date') return;

  return dd;
}

export function dateWithTz(date: Date, tz?: Timezone): Date {
  return zonedTimeToUtc(date.toISOString().substring(0, 11), tz || defaultTz);
}

export function today(tz?: Timezone): Date {
  return dateWithTz(new Date(), tz);
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

export function subMonthsTz(d: Date, months: number, tz?: Timezone): Date {
  return zonedTimeToUtc(subMonths(utcToZonedTime(d, tz || defaultTz), months), tz || defaultTz);
}

export function startOfMonthTz(d: Date, tz?: Timezone): Date {
  return zonedTimeToUtc(startOfMonth(utcToZonedTime(d, tz || defaultTz)), tz || defaultTz);
}
