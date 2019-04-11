const modelFactory = require('../../shared/packages/mongo/model-factory');
const OperatorSchema = require('../schemas/operator');

module.exports = modelFactory('Operator', {
  schema: OperatorSchema,
});
