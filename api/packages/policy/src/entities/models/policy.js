const { modelFactory } = require('@pdc/shared-providers').mongo;
const IncentivePolicySchema = require('../schemas/policy');

export default modelFactory('IncentivePolicy', {
  schema: IncentivePolicySchema,
});
