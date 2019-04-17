const modelFactory = require('@pdc/shared/providers/mongo/model-factory');
const IncentiveSchema = require('../schemas/incentive');

module.exports = modelFactory('Incitation', {
  schema: IncentiveSchema,
});
