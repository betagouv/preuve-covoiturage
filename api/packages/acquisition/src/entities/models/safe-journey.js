const _ = require('lodash');
const mongoose = require('mongoose');
const slugify = require('slugify');

const { modelFactory } = require('@pdc/shared-providers').mongo;
const SafeJourneySchema = require('../schemas/safe-journey');

module.exports = modelFactory('SafeJourney', {
  schema: SafeJourneySchema,
  pre: {
    save: [
      async (schema, doc) => {
        const isDoc = doc instanceof mongoose.Document;
        const docObj = isDoc ? doc.toObject() : doc;
        const isNew = isDoc ? false : !!doc.isNew;

        if (doc.isModified('journey_id') || isNew) {
          const opSlug = slugify(_.get(docObj.operator, 'nom_commercial', '')).toLowerCase();
          if (opSlug !== '') {
            // eslint-disable-next-line no-param-reassign
            doc.journey_id = `${opSlug}:${doc.journey_id}`;
          }
        }

        return doc;
      },
    ],
  },
});
