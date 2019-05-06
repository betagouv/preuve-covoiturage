const modelFactory = require('@pdc/shared/providers/mongo/model-factory');
const TripSchema = require('../schemas/trip');

module.exports = modelFactory('Trip', {
  schema: TripSchema,
});
