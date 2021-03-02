import { Format } from '@ilos/validator';

export const sirenCustomFormat: Format = (data: string): boolean => {
  return /^[0-9]{9}$/.test(data);
};
