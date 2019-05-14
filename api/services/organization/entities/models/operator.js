const modelFactory = require('@pdc/shared/providers/mongo/model-factory');
const OperatorSchema = require('../schemas/operator');

module.exports = modelFactory('Operator', {
  schema: OperatorSchema,
  methods: {
    // {coll: string, orgId: ObjectId}
    setAuthorisations(schema, doc, { coll, authList }) {
      const d = doc;

      // unset all authorisations matching the same collection
      d.authorisations = d.authorisations.filter(a => coll.indexOf(a.coll) === -1);

      // apply given authorisations
      authList.forEach(({ collec, orgId }) => {
        d.authorisations.push({ collec, _id: orgId });
      });

      return d;
    },

    // {coll: string, orgId: ObjectId}
    unsetAuthorisations(schema, doc, { coll, orgId }) {
      const d = doc;
      d.authorisations = d.authorisations.filter(a => a.coll === coll && a._id === orgId);

      return d;
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
