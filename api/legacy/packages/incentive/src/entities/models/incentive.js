const { modelFactory } = require('@pdc/shared-providers').mongo;
const IncentiveSchema = require('../schemas/incentive');

export default modelFactory('Incitation', {
  schema: IncentiveSchema,
});
