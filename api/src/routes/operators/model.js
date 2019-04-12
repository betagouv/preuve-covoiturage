const modelFactory = require('../../packages/mongo/model-factory');
const OperatorSchema = require('../../database/schemas/operator');

module.exports = modelFactory('Operator', {
  schema: OperatorSchema,
  virtuals: {
    nicename: {
      get(schema, doc) {
        return doc.nom_commercial;
      },
    },
  },
});
