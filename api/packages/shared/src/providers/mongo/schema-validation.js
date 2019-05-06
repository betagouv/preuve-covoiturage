const regex = require('./schemas/regex');
const validators = require('./schemas/validators');
const setters = require('./schemas/setters');
const getters = require('./schemas/getters');

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
