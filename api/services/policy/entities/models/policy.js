const modelFactory = require('@pdc/shared/providers/mongo/model-factory');
const IncentivePolicySchema = require('../schemas/policy');

module.exports = modelFactory('IncentivePolicy', {
  schema: IncentivePolicySchema,
});
