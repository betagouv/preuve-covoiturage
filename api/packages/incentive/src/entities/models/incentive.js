const { modelFactory } = require('@pdc/shared-providers').mongo;
const IncentiveSchema = require('../schemas/incentive');

module.exports = modelFactory('Incitation', {
  schema: IncentiveSchema,
});
