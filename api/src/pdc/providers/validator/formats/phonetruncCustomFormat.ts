import { Format } from '@/ilos/validator/index.ts';
import { isValidPhoneTrunc } from '../lib/phone.ts';

/**
 * Append 00 to the phone number and validate it with the 'phone' format
 */
export const phonetruncCustomFormat: Format = (data: string): boolean => {
  return isValidPhoneTrunc(data);
};
