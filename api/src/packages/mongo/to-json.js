/* eslint-disable no-param-reassign */
const _ = require('lodash');
const listKeys = require('./list-keys');

/**
 * Convert a Mongoose Document to JSON object
 * Hide all the props with {hidden: true}
 * Convert _id to String
 *
 * @param schema
 * @param doc
 */
const toJSON = (schema, doc) => {
  schema = schema.tree ? schema.tree : schema;

  // list all 'hidden' fields
  const picked = schema ? _.difference(
    Object.keys(schema),
    listKeys('hidden', true, schema, [
      'id',
      '__v',
      'password',
      'token',
    ]),
  ) : [];

  // convert ObjectId(_id) to String
  doc = doc.toObject({ getters: true, virtuals: true });
  doc._id = doc._id.toString();

  return _.pick(doc, picked);
};

module.exports = toJSON;
