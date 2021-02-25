import { Format } from '@ilos/validator';

export const rnaCustomFormat: Format = (data: string): boolean => {
  return /^W[0-9]{9}$/.test(data);
}
