const { modelFactory } = require('@pdc/shared-providers').mongo;
const TripSchema = require('../schemas/trip');

export default modelFactory('Trip', {
  schema: TripSchema,
});
