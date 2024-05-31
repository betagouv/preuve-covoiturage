import { Format } from '@ilos/validator/index.ts';

export const nicCustomFormat: Format = (data: string): boolean => {
  return /^[0-9]{5}$/.test(data);
};
