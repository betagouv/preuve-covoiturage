const modelFactory = require('@pdc/shared/packages/mongo/model-factory');
const IncentivePolicySchema = require('../../../database/schemas/incentive-policy');

module.exports = modelFactory('IncentivePolicy', {
  schema: IncentivePolicySchema,
});
