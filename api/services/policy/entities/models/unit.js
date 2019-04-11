const modelFactory = require('@pdc/shared/packages/mongo/model-factory');
const IncentiveUnitSchema = require('../../../database/schemas/incentive-unit');

module.exports = modelFactory('IncentiveType', {
  schema: IncentiveUnitSchema,
});
