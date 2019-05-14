const { modelFactory } = require('@pdc/shared-providers').mongo;
const IncentiveParameterSchema = require('../schemas/parameter');

export default modelFactory('IncentiveParameter', {
  schema: IncentiveParameterSchema,
});
