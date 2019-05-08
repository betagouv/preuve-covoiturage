const modelFactory = require('@pdc/shared/providers/mongo/model-factory');
const TripSchema = require('../../entities/schemas/trip');

module.exports = modelFactory('Trip', {
  schema: TripSchema,
});
