const modelFactory = require('@pdc/shared/packages/mongo/model-factory');
const IncentiveUnitSchema = require('../schemas/unit');

module.exports = modelFactory('IncentiveType', {
  schema: IncentiveUnitSchema,
});
