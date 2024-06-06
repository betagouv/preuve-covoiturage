import { Format } from '/ilos/validator/index.ts';
import { isValidIBAN } from 'ibantools';

export const ibanCustomFormat: Format = (data: string): boolean => {
  return isValidIBAN(data);
};
