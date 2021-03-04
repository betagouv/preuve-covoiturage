import { Format } from '@ilos/validator';
import { validatePhone } from './phoneCustomFormat';

/**
 * Append 00 to the phone number and validate it with the 'phone' format
 */
export const phonetruncCustomFormat: Format = (data: string): boolean => {
  return validatePhone(`${data}00`);
};
