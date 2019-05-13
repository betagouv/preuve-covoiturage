const { modelFactory } = require('@pdc/shared-providers').mongo;
const StatSchema = require('../schemas/stat');

module.exports = modelFactory('Stat', {
  schema: StatSchema,
});
