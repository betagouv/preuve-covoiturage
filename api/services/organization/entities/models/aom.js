const _ = require('lodash');
const modelFactory = require('@pdc/shared/providers/mongo/model-factory');
const AomSchema = require('../schemas/aom');

module.exports = modelFactory('Aom', {
  schema: AomSchema,
  methods: {
    // {coll: string, id: ObjectId}
    async setAuthorised(schema, doc, { coll, id }) {
      doc.authorised.push({ coll, _id: id });

      return doc;
    },

    // {coll: string, id: ObjectId}
    async unsetAuthorised(schema, doc, { coll, id }) {
      doc.authorised = doc.authorised.filter(a => a.coll === coll && a._id === id);

      return doc;
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
