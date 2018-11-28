const journeyService = require('./journey-service');

// const onCreateOrUpdate = async (journey) => {
//   setImmediate(async () => {
//
//   });
// };

const onUpsert = async (journey) => {
  setImmediate(async () => {
    // TODO clear planned step1 and step2 validations

    await journeyService.validate(journey);

    // TODO set a test in 24 hours
    // TODO set a test in 48 hours

    return journey;
  });
};

module.exports = {
  // create: onCreateOrUpdate,
  // update: onCreateOrUpdate,
  upsert: onUpsert,
};
