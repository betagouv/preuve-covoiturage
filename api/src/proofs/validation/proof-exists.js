const _ = require('lodash');

module.exports = function proofExists(proof) {
  return _.has(proof, '_id');
};
