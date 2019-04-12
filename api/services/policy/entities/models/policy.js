const modelFactory = require('@pdc/shared/packages/mongo/model-factory');
const IncentivePolicySchema = require('../schemas/policy');

module.exports = modelFactory('IncentivePolicy', {
  schema: IncentivePolicySchema,
});
