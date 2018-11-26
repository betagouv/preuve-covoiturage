const _ = require('lodash');
const Proof = require('../proof-model');



// has at least a drive AND a passenger
module.exports = async function hasDriverAndPassenger(model) {

  const proof = model.toJSON();

  if (true === proof.is_driver) {

    // IS A DRIVER

    const connectedProofs = await Proof.find(
      {
        is_driver: false,
        journey_id: proof.journey_id,
        deletedAt: null,
        traveler_hash: {$en: proof.traveler_hash}
      }
    );

    // is connected to passengers
    if ([] !== connectedProofs) {
      return true;
    }


  } else {

    //IS A PASSENGER

    const connectedProofs = await Proof.find(
      {
        is_driver: true,
        journey_id: proof.journey_id,
        deletedAt: null,
        traveler_hash: {$en: proof.traveler_hash}
      }
    );
    // is connected to a driver
    if ([] !== connectedProofs) {
      return true;
    }

  }

  return false;

};
