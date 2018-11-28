const proofService = require('./proof-service');
const journeyService = require('../journeys/journey-service');

const onCreateOrUpdate = async (proof) => {
  setImmediate(async () => {
    // compute some additional data
    await proofService.enrich(proof);

    // create or add to a journey to match with other proofs
    await journeyService.upsert(proof);
  });
};

module.exports = {
  create: onCreateOrUpdate,
  update: onCreateOrUpdate,
};
