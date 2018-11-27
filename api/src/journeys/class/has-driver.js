const _ = require('lodash');
const Proof = require('../../proofs/proof-model');
const Journey = require('../journey-model');



// has at least a drive AND a passenger
module.exports = async function hasDriver(model) {

  const journey = model.toJSON();
  return ([] !== journey.driver);

};
