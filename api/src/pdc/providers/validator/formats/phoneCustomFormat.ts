import { Format } from '@/ilos/validator/index.ts';
import { isValidPhone } from '../lib/phone.ts';

/**
 * validate the phone number.
 * Defaults to FR phone (+33) if intl code is missing
 * ARCEP Specs :
 * - https://archives.arcep.fr/uploads/tx_gsavis/18-0881.pdf
 * - https://archives.arcep.fr/index.php?id=8789
 */
export const phoneCustomFormat: Format = (data: string): boolean => {
  return isValidPhone(data);
};
