const modelFactory = require('../../../packages/mongo/model-factory');
const IncentiveParameterSchema = require('../../../database/schemas/incentive-parameter');

module.exports = modelFactory('IncentiveParameter', {
  schema: IncentiveParameterSchema,
});
