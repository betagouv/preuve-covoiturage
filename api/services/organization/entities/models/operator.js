const modelFactory = require('@pdc/shared/packages/mongo/model-factory');
const OperatorSchema = require('../schemas/operator');

module.exports = modelFactory('Operator', {
  schema: OperatorSchema,
});
