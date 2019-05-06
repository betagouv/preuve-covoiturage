const modelFactory = require('@pdc/shared/providers/mongo/model-factory');
const IncentiveParameterSchema = require('../schemas/parameter');

module.exports = modelFactory('IncentiveParameter', {
  schema: IncentiveParameterSchema,
});
