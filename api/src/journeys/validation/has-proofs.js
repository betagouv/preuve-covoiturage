const _ = require('lodash');

module.exports = (journey) => {
  const proofs = _.get(journey.toObject(), 'proofs', []);

  return !!proofs.length;
};
