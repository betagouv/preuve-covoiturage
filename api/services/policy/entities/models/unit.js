const modelFactory = require('@pdc/shared/providers/mongo/model-factory');
const IncentiveUnitSchema = require('../schemas/unit');

module.exports = modelFactory('IncentiveType', {
  schema: IncentiveUnitSchema,
});
