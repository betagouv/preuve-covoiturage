const modelFactory = require('@pdc/shared/providers/mongo/model-factory');
const JourneySchema = require('../schemas/journey');

module.exports = modelFactory('Journey', {
  schema: JourneySchema,
});
