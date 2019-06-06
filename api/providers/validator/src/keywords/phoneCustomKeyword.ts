import { PhoneNumberUtil, PhoneNumber } from 'google-libphonenumber';

export const phoneCustomKeyword = {
  name: 'phone',
  type: 'string',

  /**
   * validate the phone number.
   * Defaults to FR phone (+33) if intl code is missing
   */
  definition(data: string): boolean {
    try {
      const phoneUtil: PhoneNumberUtil = PhoneNumberUtil.getInstance();
      const phone: PhoneNumber = phoneUtil.parseAndKeepRawInput(data, data.substr(0, 1) === '+' ? null : 'FR');

      return phoneUtil.isValidNumber(phone);
    } catch (e) {
      return false;
    }
  },
};
