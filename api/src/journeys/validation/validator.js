const _ = require('lodash');

// require all tests here
const hasProofs = require('./has-proofs');
const hasDriver = require('./has-driver');
const hasPassenger = require('./has-passenger');

const validator = {
  isValid(results, rank) {
    // TODO define if the results make it a valid or not
    if (results && rank) {
      return true;
    }

    return false;
  },

  calcRank(results) {
    // TODO get the rank definitions from configuration

    return 'A';
  },

  async process(journey) {
    const step = _.isNil(journey.step) ? 0 : journey.step;
    const tests = validator.tests[`step${step}`];

    return Object.keys(tests).reduce(async (list, k) => {
      // eslint-disable-next-line no-param-reassign
      list[_.snakeCase(k)] = await tests[k](journey);

      return list;
    }, {});
  },

  // require tests at the top and add here
  tests: {
    step0: {
      hasProofs,
      hasDriver,
      hasPassenger,
    },
    step1: {
      hasProofs,
    },
    step2: {
      hasProofs,
    },
  },
};

module.exports = validator;
