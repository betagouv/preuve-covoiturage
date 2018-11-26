const _ = require('lodash');

module.exports = function proofExists(model) {
  const proof = model.toJSON();

  return _.has(proof, '_id');
};
