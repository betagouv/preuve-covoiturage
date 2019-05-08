const _ = require('lodash');
const modelFactory = require('@pdc/shared/providers/mongo/model-factory');
const AomSchema = require('../schemas/aom');

module.exports = modelFactory('Aom', {
  schema: AomSchema,
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
