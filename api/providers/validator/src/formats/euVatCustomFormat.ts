import { Format } from '@ilos/validator';

export const euVatCustomFormat: Format = (data: string): boolean => {
  return /^[A-Z]{2}[A-Z0-9]{2}[0-9]{9}$/.test(data);
}
