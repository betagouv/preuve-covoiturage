const modelFactory = require('@pdc/shared/packages/mongo/model-factory');
const StatSchema = require('../../database/schemas/stats');

module.exports = modelFactory('Stat', {
  schema: StatSchema,
});
