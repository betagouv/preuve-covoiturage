const _ = require('lodash');
const Proof = require('../../proofs/proof-model');
const Journey = require('../journey-model');



// has at least a drive AND a passenger
module.exports = async function hasDriverAndPassenger(model) {

  const journey = model.toJSON();
  return ([] !== journey.passengers);

};
