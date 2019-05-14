const slugify = require('slugify');
const { PhoneNumberFormat } = require('google-libphonenumber');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const { electronicFormatIBAN } = require('ibantools');

/**
 * Mongoose setters for the values
 * Runs first, before validators
 */
export default {
  phone(v) {
    const number = phoneUtil.parseAndKeepRawInput(v, v.substr(0, 1) === '+' ? null : 'FR');

    if (!phoneUtil.isValidNumber(number)) {
      return v;
    }

    return phoneUtil.format(number, PhoneNumberFormat.E164);
  },
  iban(v) {
    return electronicFormatIBAN(v);
  },
  bic(v) {
    return v.replace(/[^0-9A-Z]/gi, '');
  },
  cardName(v) {
    return slugify(v).toLowerCase();
  },
};
