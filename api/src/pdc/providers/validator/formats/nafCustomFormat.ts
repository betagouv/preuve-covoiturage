import { Format } from '@ilos/validator/index.ts';

export const nafCustomFormat: Format = (data: string): boolean => {
  return /^[0-9]{4}[A-Z]{1}$/.test(data);
};
