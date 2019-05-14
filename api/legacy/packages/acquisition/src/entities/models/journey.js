const { modelFactory } = require('@pdc/shared-providers').mongo;
const JourneySchema = require('../schemas/journey');

export default modelFactory('Journey', {
  schema: JourneySchema,
});
