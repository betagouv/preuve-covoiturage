const _ = require('lodash');
const modelFactory = require('@pdc/shared/providers/mongo/model-factory');
const AomSchema = require('../schemas/aom');

module.exports = modelFactory('Aom', {
  schema: AomSchema,
  methods: {
    // {coll: string, id: ObjectId}
    pushAuthorised(schema, doc, { coll, id }) {
      const d = doc;
      d.authorised.push({ coll, _id: id });

      return d;
    },

    // {coll: string, id: ObjectId}
    pullAuthorised(schema, doc, { coll, id }) {
      const d = doc;
      d.authorised = d.authorised.filter(a => a.coll === coll && a._id === id);

      return d;
    },
  },
  virtuals: {
    nicename: {
      get(schema, doc) {
        return doc.name
          .trim()
          .toLowerCase()
          .split(' ')
          .map(w => (w.length > 2 ? _.upperFirst(w) : w))
          .join(' ');
      },
    },
  },
});
