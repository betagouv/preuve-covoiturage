const modelFactory = require('@pdc/shared/providers/mongo/model-factory');
const OperatorSchema = require('../schemas/operator');

module.exports = modelFactory('Operator', {
  schema: OperatorSchema,
  methods: {
    // {coll: string, orgId: ObjectId}
    async setAuthorisation(schema, doc, { coll, orgId }) {
      doc.authorisations.push({ coll, _id: orgId });

      return doc;
    },

    // {coll: string, orgId: ObjectId}
    async unsetAuthorisation(schema, doc, { coll, orgId }) {
      doc.authorisations = doc.authorisations.filter(
        a => a.coll === coll && a._id === orgId,
      );

      return doc;
    },
  },
  virtuals: {
    nicename: {
      get(schema, doc) {
        return doc.nom_commercial;
      },
    },
  },
});
