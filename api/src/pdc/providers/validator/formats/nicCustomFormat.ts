import { Format } from '@ilos/validator';

export const nicCustomFormat: Format = (data: string): boolean => {
  return /^[0-9]{5}$/.test(data);
};
