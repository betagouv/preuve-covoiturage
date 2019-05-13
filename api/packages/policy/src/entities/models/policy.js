const { modelFactory } = require('@pdc/shared-providers').mongo;
const IncentivePolicySchema = require('../schemas/policy');

module.exports = modelFactory('IncentivePolicy', {
  schema: IncentivePolicySchema,
});
