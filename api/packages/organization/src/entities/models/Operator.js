const { modelFactory } = require('@pdc/shared-providers').mongo;
const OperatorSchema = require('../schemas/operator');

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
