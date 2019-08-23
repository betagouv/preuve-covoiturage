const excluded = (key) => [
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

const round = (num, p = 3) => {
  const factor = 10 ** p;
  return Math.round(num * factor) / factor;
};

const anonymize = (line) => {
  const filtered = { ...line };
  // const filtered = Object.keys(line).reduce((acc, key) => {
  //   const val = line[key];

  //   // remove GDPR data by keys
  //   // QUICK solution to be refactored
  //   // as a 'personal' key in the JSON Schema
  //   // #migrateme
  //   if (excluded(key)) {
  //     return acc;
  //   }

  //   acc[key] = val;

  //   return acc;
  // }, {});

  filtered['passenger.start.datetime'] = new Date(filtered['passenger.start.datetime']).toISOString();
  filtered['passenger.end.datetime'] = new Date(filtered['passenger.end.datetime']).toISOString();
  filtered['driver.start.datetime'] = new Date(filtered['driver.start.datetime']).toISOString();
  filtered['driver.end.datetime'] = new Date(filtered['driver.end.datetime']).toISOString();

  filtered['passenger.start.lon'] = round(filtered['passenger.start.lon']);
  filtered['passenger.start.lat'] = round(filtered['passenger.start.lat']);
  filtered['passenger.end.lon'] = round(filtered['passenger.end.lon']);
  filtered['passenger.end.lat'] = round(filtered['passenger.end.lat']);

  filtered['driver.start.lon'] = round(filtered['driver.start.lon']);
  filtered['driver.start.lat'] = round(filtered['driver.start.lat']);
  filtered['driver.end.lon'] = round(filtered['driver.end.lon']);
  filtered['driver.end.lat'] = round(filtered['driver.end.lat']);

  return filtered;
};

module.exports = { anonymize };
