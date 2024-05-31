import { Format } from '@ilos/validator/index.ts';

export const siretCustomFormat: Format = (data: string): boolean => {
  return /^[0-9]{14}$/.test(data);
};
