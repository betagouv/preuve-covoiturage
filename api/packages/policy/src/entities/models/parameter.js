const { modelFactory } = require('@pdc/shared-providers').mongo;
const IncentiveParameterSchema = require('../schemas/parameter');

module.exports = modelFactory('IncentiveParameter', {
  schema: IncentiveParameterSchema,
});
