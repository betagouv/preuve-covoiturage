import { InvalidParamsException } from '@ilos/common';
import { isValid } from 'date-fns';

export function getDateOrFail(data: any, message: string): Date {
  const date = new Date(data);
  if (!isValid(date)) {
    throw new InvalidParamsException(message);
  }
  return date;
}
