import { Format } from '@ilos/validator';
import { isValidIBAN } from 'ibantools';

export const ibanCustomFormat: Format = (data: string): boolean => {
  return isValidIBAN(data);
};
