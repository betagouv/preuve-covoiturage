const modelFactory = require('@pdc/shared/packages/mongo/model-factory');
const StatSchema = require('../schemas/stat');

module.exports = modelFactory('Stat', {
  schema: StatSchema,
});
