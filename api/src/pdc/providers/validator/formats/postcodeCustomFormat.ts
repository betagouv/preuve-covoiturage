import { Format } from '@ilos/validator/index.ts';

export const postcodeCustomFormat: Format = (data: string): boolean => {
  try {
    return /^[0-9][0-9A-B][0-9]{3}$/.test(data);
  } catch (e) {
    return false;
  }
};
