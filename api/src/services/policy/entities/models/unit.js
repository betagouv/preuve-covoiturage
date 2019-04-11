const modelFactory = require('../../../packages/mongo/model-factory');
const IncentiveUnitSchema = require('../../../database/schemas/incentive-unit');

module.exports = modelFactory('IncentiveType', {
  schema: IncentiveUnitSchema,
});
