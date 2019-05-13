const { modelFactory } = require('@pdc/shared-providers').mongo;
const JourneySchema = require('../schemas/journey');

module.exports = modelFactory('Journey', {
  schema: JourneySchema,
});
