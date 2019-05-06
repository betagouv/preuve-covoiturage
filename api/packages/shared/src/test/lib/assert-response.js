/* eslint-disable no-param-reassign */
const _ = require('lodash');
const assert = require('assert');
const BadRequestError = require('../../errors/bad-request');

/**
 * Extract the useful response from API response structure
 *
 * @param res
 * @returns {*}
 */
const getResponse = (res) => {
  const response = _.get(res.body, 'payload.data');
  if (!response) throw new BadRequestError('Empty response');

  return response;
};

/**
 * Recursive check on actual values compared by expected
 *
 * @param response
 * @param node
 * @param keys
 * @returns {Array}
 */
const assertResponse = (response, node, keys = []) => _.forEach(node, (expected, key) => {
  // build the path
  keys.push(key);

  // extract actual value using that path
  const actual = _.get(response, keys.join('.'));

  switch (true) {
    // run a regex against actual value
    case expected instanceof RegExp:
      assert.equal(expected.test(actual), true, keys.join('.'));
      break;

    // run a custom function against actual value
    // function must return TRUE to match or throw an Error
    case _.isFunction(expected):
      assert.equal(expected(actual), true, keys.join('.'));
      break;

    // recursive scanning if an object
    case _.isObject(expected):
      assertResponse(response, expected, keys);
      break;

    // compare equality
    default:
      assert.equal(expected, actual, keys.join('.'));
  }

  keys.pop();
});

module.exports = (status, body = {}) => (res) => {
  if (_.isObject(status)) body = status;

  assertResponse(getResponse(res), body, []);

  return res;
};
