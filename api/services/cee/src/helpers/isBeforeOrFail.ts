import { InvalidParamsException } from '@ilos/common';
import { isBefore, sub } from 'date-fns';

export function isBeforeOrFail(date: Date, days: number): void {
  if (!isBefore(date, sub(new Date(), { days }))) {
    throw new InvalidParamsException(`Date should be before ${days} days from now`);
  }
}
