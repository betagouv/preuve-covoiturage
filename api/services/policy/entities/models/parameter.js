const modelFactory = require('@pdc/shared/packages/mongo/model-factory');
const IncentiveParameterSchema = require('../../../database/schemas/incentive-parameter');

module.exports = modelFactory('IncentiveParameter', {
  schema: IncentiveParameterSchema,
});
