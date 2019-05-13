const { modelFactory } = require('@pdc/shared-providers').mongo;
const IncentiveUnitSchema = require('../schemas/unit');

module.exports = modelFactory('IncentiveType', {
  schema: IncentiveUnitSchema,
});
