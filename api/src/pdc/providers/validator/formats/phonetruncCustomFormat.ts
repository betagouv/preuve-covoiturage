import { Format } from '@ilos/validator';
import { isValidPhoneTrunc } from '../lib/phone';

/**
 * Append 00 to the phone number and validate it with the 'phone' format
 */
export const phonetruncCustomFormat: Format = (data: string): boolean => {
  return isValidPhoneTrunc(data);
};
