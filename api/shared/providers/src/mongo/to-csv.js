/* eslint-disable no-param-reassign */
const _ = require('lodash');
const mongoose = require('mongoose');
const listKeys = require('./list-keys');

const { ObjectId } = mongoose.Types;

const mapper = obj => Object
  .keys(obj)
  .reduce((prev, key) => {
    const p = Object.assign(Object.create(null), prev);
    let item = obj[key];

    if (item instanceof ObjectId) {
      item = item.toString();
    }

    // eslint-disable-next-line default-case
    switch (key) {
      case 'createdAt':
      case 'updatedAt':
      case 'deletedAt':
      case 'datetime':
        item = item ? item.toISOString() : item;
        break;
      case 'postcodes':
        item = Array.isArray(item) ? item.join(',') : '';
        break;
    }

    p[key] = _.isObject(item) ? mapper(item) : item;

    return p;
  }, Object.create(null));

/**
 * Convert a Mongoose Document to CSV object
 * Hide all the props with {hidden: true}
 * Convert _id to String
 *
 * @param schema
 * @param doc
 */
export default (schema, doc) => {
  schema = schema.tree ? schema.tree : schema;

  // list all 'hidden' fields
  const picked = schema ? _.difference(
    Object.keys(schema),
    listKeys('hidden', true, schema, [
      '__v',
      'password',
      'token',
    ]),
  ) : [];

  doc = doc.toObject({ getters: true, virtuals: true });

  return _.pick(mapper(doc), picked);
};
