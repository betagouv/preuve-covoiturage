/* eslint-disable no-useless-escape */
const _ = require('lodash');
const slugify = require('slugify');
const { PhoneNumberFormat } = require('google-libphonenumber');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const { electronicFormatIBAN, isValidIBAN, isValidBIC } = require('ibantools');

/**
 * Match regexes for the schemas
 * Runs after the setters
 *
 * match: regex.something
 */
const regex = {
  phone: /^(?:(?:\+)[0-9]{1,3}|0)(\s*\(0\))?\s*[1-9](?:[\s.-]*\d{2}){4}$/,
  email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  insee: /^[0-9][0-9AB][0-9]{3}$/,
  siren: /^[0-9]{9}$/,
  siret: /^[0-9]{12}$/,
  naf: /^[0-9]{4}[A-Z]{1}$/,
  nic: /^[0-9]{5}$/,
  vatIntra: /^[A-Z]{2}[A-Z0-9]{2}[0-9]{9}$/,
  postcode: /^[0-9][0-9AB][0-9]{2,3}$/,
  cedex: /^[0-9]{5}$/,
  lon: /^-?[0-9]{1,3}(\.[0-9]+)?$/,
  lat: /^-?[0-9]{1,2}(\.[0-9]+)?$/,
};

/**
 * Mongoose validators
 * Runs after the setters
 *
 * @url https://mongoosejs.com/docs/validation.html
 */
const validators = {
  iban: {
    message: p => `${p.value} is not a valid IBAN`,
    validator: v => isValidIBAN(v),
  },
  bic: {
    message: p => `${p.value} is not a valid BIC`,
    validator: v => isValidBIC(v),
  },
  lon: {
    message: p => `${p.value} is not a valid longitude`,
    validator: (v) => {
      const decimal = parseFloat(v);
      if (_.isNaN(decimal)) throw new Error('lon must be a decimal');
      if (decimal < -180 || decimal > 180) throw new Error('lon must be between -180 and 180');

      return true;
    },
  },
  lat: {
    message: p => `${p.value} is not a valid latitude`,
    validator(v) {
      const decimal = parseFloat(v);
      if (_.isNaN(decimal)) throw new Error('lat must be a decimal');
      if (decimal < -90 || decimal > 90) throw new Error('lat must be between -90 and 90');

      return true;
    },
  },
  phone: {
    validator(v) {
      const number = phoneUtil.parseAndKeepRawInput(v, v.substr(0, 1) === '+' ? null : 'FR');

      if (!phoneUtil.isValidNumber(number)) {
        throw new Error('Invalid phone number');
      }

      return true;
    },
  },
  position: {
    validator(pos) {
      if (!pos) throw new Error('position must be an object');
      if (!_.isObject(pos)) throw new Error('position must be an object');
      if (!pos.datetime) throw new Error('Missing datetime');

      if (_.isNumber(pos.lon) && _.isNumber(pos.lat)) return true;
      if (_.isString(pos.insee) && pos.insee !== '') return true;
      if (_.isString(pos.literal) && pos.literal !== '') return true;

      throw new Error('lon/lat OR insee OR literal must be defined');
    },
  },
};

/**
 * Mongoose setters for the values
 * Runs first, before validators
 */
const setters = {
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
    return v.replace(/[^0-9A-Z]/ig, '');
  },
  cardName(v) {
    return slugify(v);
  }
};

/**
 * Mongoose getters
 */
const getters = {};

/**
 * Manual validator for use on a single field
 *
 * @param field
 * @param value
 * @return {Boolean}
 */
const validate = (field, value) => {
  if (setters[field]) {
    // eslint-disable-next-line no-param-reassign
    value = setters[field](value);
  }

  if (regex[field]) {
    if (!regex[field].test(value)) {
      throw new Error('FormatError');
    }
  }

  if (validators[field]) {
    if (!validators[field].validator(value)) {
      throw new Error('ValidationError');
    }
  }

  return true;
};

module.exports = {
  regex,
  validators,
  setters,
  getters,
  validate,
};
