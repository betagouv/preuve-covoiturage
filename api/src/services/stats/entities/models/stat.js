const modelFactory = require('../../packages/mongo/model-factory');
const StatSchema = require('../../database/schemas/stats');

module.exports = modelFactory('Stat', {
  schema: StatSchema,
});
