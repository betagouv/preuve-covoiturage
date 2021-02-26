import { Format } from '@ilos/validator';
import { PhoneNumberUtil, PhoneNumber } from 'google-libphonenumber';

export function validatePhone(data: string): boolean {
  try {
    const phoneUtil: PhoneNumberUtil = PhoneNumberUtil.getInstance();
    const phone: PhoneNumber = phoneUtil.parseAndKeepRawInput(data, data.substr(0, 1) === '+' ? null : 'FR');

    return phoneUtil.isValidNumber(phone);
  } catch (e) {
    return false;
  }
}
/**
 * validate the phone number.
 * Defaults to FR phone (+33) if intl code is missing
 * ARCEP Specs :
 * - https://archives.arcep.fr/uploads/tx_gsavis/18-0881.pdf
 * - https://archives.arcep.fr/index.php?id=8789
 */
export const phoneCustomFormat: Format = (data: string): boolean => {
  return validatePhone(data); 
}
