const { modelFactory } = require('@pdc/shared-providers').mongo;
const IncentiveUnitSchema = require('../schemas/unit');

export default modelFactory('IncentiveType', {
  schema: IncentiveUnitSchema,
});
