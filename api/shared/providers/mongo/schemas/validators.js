const _ = require('lodash');
const config = require('@pdc/package-config/config');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const { isValidIBAN, isValidBIC } = require('ibantools');

/**
 * Mongoose validators
 * Runs after the setters
 *
 * @url https://mongoosejs.com/docs/validation.html
 */
module.exports = {
  iban: {
    message: (p) => `${p.value} is not a valid IBAN`,
    validator: (v) => isValidIBAN(v),
  },
  bic: {
    message: (p) => `${p.value} is not a valid BIC`,
    validator: (v) => isValidBIC(v),
  },
  lon: {
    message: (p) => `${p.value} is not a valid longitude`,
    validator: (v) => {
      const decimal = parseFloat(v);
      if (_.isNaN(decimal)) throw new Error('lon must be a decimal');
      if (decimal < -180 || decimal > 180) throw new Error('lon must be between -180 and 180');

      return true;
    },
  },
  lat: {
    message: (p) => `${p.value} is not a valid latitude`,
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

      if (!phoneUtil.isPossibleNumber(number)) {
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
  cardName: {
    validator(name) {
      const list = _.get(config, 'travelPass.authorized', []);
      if (list.indexOf(name) > -1) {
        return true;
      }

      throw new Error(`Unsupported travel_pass name: ${name}`);
    },
  },
};
