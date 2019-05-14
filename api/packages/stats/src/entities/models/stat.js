const { modelFactory } = require('@pdc/shared-providers').mongo;
const StatSchema = require('../schemas/stat');

export default modelFactory('Stat', {
  schema: StatSchema,
});
