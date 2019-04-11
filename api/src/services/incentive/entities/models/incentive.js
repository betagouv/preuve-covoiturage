const modelFactory = require('../../../packages/mongo/model-factory');
const IncentiveSchema = require('../../../database/schemas/incentive');

module.exports = modelFactory('Incitation', {
  schema: IncentiveSchema,
});
