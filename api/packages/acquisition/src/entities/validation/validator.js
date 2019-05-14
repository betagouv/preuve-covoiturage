const _ = require('lodash');
const { validation } = require('../../../../packages/config/config');
const validations = require('./validations');


// set up tests from the validation config file
const compiledTests = {};
validation.journey.steps.forEach((step) => {
  compiledTests[`step${step.name}`] = {};
  step.tests.forEach((test) => {
    const testFn = _.camelCase(test);
    if (_.has(validations, testFn)) {
      compiledTests[`step${step.name}`][testFn] = validations[testFn];
    }
  });
});

const validator = {
  tests: compiledTests,

  /**
   * A proof is valid if it satisfies the least capable
   * rank tests
   *
   * @param results
   * @returns {*}
   */
  isValid(results) {
    return this.checkRankTests(results, validation.journey.ranks[0]);
  },

  /**
   * calculate the journey rank from the list of passed tests.
   * Tests are configured in config/validation.yml
   * To belong to a rank, all tests must pass.
   *
   * @param results
   * @returns {*}
   */
  calcRank(results) {
    try {
      const ordered = _.orderBy(validation.journey.ranks, 'name', 'desc');
      ordered.forEach((rank) => {
        if (this.checkRankTests(results, rank)) {
          throw rank.name;
        }
      });
    } catch (pass) {
      return pass;
    }

    // not matching any rank
    return null;
  },

  /**
   * Check if all tests pass for a rank
   * Reduce the boolean value with &&
   *
   * @param results
   * @param tests
   * @returns {*}
   */
  checkRankTests(results, { logic, tests }) {
    const testNames = tests.map(t => _.camelCase(t));
    return logic === 'or'
      ? testNames.reduce((p, testName) => p || _.get(results, testName, false), false)
      : testNames.reduce((p, testName) => p && _.get(results, testName, false), true);
  },

  async process(journey) {
    const step = _.isNil(journey.validation.step) ? 0 : journey.validation.step;
    const tests = validator.tests[`step${step}`];
    const promises = [];
    const keys = [];

    // build the promises array
    Object.keys(tests).forEach((k, i) => {
      keys[i] = k;
      promises[i] = tests[k](journey);
    });

    // wait for all values to be calculated
    const values = await Promise.all(promises);

    // rebuild an object as {test: result}
    return keys.reduce((p, c, i) => {
      const obj = {};
      obj[c] = values[i];
      return _.assign(p, obj);
    }, {});
  },
};

export default validator;
