const _ = require('lodash');

const excluded = key => [
  '_id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'operator._id',
  'name',
  'safe_journey_id',
  'trip_id',
  'status',
  'validation.rank',
  'validation.step',
  'validation.tests.hasProofs',
  'validation.validated',
  'validation.validatedAt',

  'driver.identity.firstname',
  'driver.identity.lastname',
  'driver.identity.phone',
  'driver.identity.email',
  'driver.identity.company',
  'driver.identity.card.number',
  'passenger.identity.firstname',
  'passenger.identity.lastname',
  'passenger.identity.phone',
  'passenger.identity.email',
  'passenger.identity.company',
  'passenger.identity.card.number',

  'driver.start.literal',
  'driver.end.literal',
  'passenger.start.literal',
  'passenger.end.literal',
].indexOf(key) > -1;

const anonymize = (line) => {
  const filtered = Object.keys(line).reduce((acc, key) => {
    const val = line[key];

    // remove GDPR data by keys
    // QUICK solution to be refactored
    // as a 'personal' key in the JSON Schema
    // #migrateme
    if (excluded(key)) {
      return acc;
    }

    acc[key] = val;

    return acc;
  }, {});

  return filtered;
};

module.exports = { anonymize };
