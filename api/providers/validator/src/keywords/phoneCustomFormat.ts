import { PhoneNumberUtil, PhoneNumber } from 'google-libphonenumber';

/**
 * validate the phone number.
 * Defaults to FR phone (+33) if intl code is missing
 */
export function phoneCustomFormat(data: string): boolean {
  try {
    const phoneUtil: PhoneNumberUtil = PhoneNumberUtil.getInstance();
    const phone: PhoneNumber = phoneUtil.parseAndKeepRawInput(data, data.substr(0, 1) === '+' ? null : 'FR');

    return phoneUtil.isValidNumber(phone);
  } catch (e) {
    return false;
  }
}
