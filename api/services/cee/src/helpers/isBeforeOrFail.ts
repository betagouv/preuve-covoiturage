import { InvalidParamsException } from '@ilos/common';
import { isAfter, isBefore, sub, startOfToday } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { defaultTz } from '../config/rules';

export function isBeforeOrFail(date: Date, days: number): void {
  if (!isBefore(date, sub(utcToZonedTime(startOfToday(), defaultTz), { days }))) {
    throw new InvalidParamsException(`Date should be before ${days} days from now`);
  }
}

export function isBetweenOrFail(date: Date, start: Date, end: Date): void {
  if (!isBefore(date, end) || !isAfter(date, start)) {
    throw new InvalidParamsException(`Date should be before between ${start.toISOString()} and ${end.toISOString()}`);
  }
}
