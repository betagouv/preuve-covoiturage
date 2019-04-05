const modelFactory = require('../../../packages/mongo/model-factory');
const IncentivePolicySchema = require('../../../database/schemas/incentive-policy');

module.exports = modelFactory('IncentivePolicy', {
  schema: IncentivePolicySchema,
});
