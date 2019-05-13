const { modelFactory } = require('@pdc/shared-providers').mongo;
const TripSchema = require('../schemas/trip');

module.exports = modelFactory('Trip', {
  schema: TripSchema,
});
