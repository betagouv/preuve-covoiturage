const _ = require('lodash');

/**
 * Extract all matching keys from the schema
 * as an Array. The seed lets the user add its own list
 *
 * @param key
 * @param value
 * @param schema
 * @param seed
 * @returns {*[]}
 */
export default (key, value, schema, seed = []) => _.sortBy(
  _.uniq(
    seed.concat(_.filter(
      _.map(schema, (v, k) => (v[key] === value ? k : null)),
      item => !!item,
    )),
  ),
);
