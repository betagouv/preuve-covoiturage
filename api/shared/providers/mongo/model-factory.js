/* eslint-disable func-names,no-param-reassign */
const _ = require('lodash');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const toJSON = require('./to-json');
const toCSV = require('./to-csv');
const listKeys = require('./list-keys');

const middlewares = {
  basics: ['validate', 'save', 'remove', 'init'],
  model: [
    'count',
    'deleteMany',
    'deleteOne',
    'find',
    'findOne',
    'findOneAndDelete',
    'findOneAndRemove',
    'findOneAndUpdate',
    'remove',
    'update',
    'updateOne',
    'updateMany',
  ],
  aggregate: ['aggregate'],
};

const saveAndUpdateHook = async (schema, doc) => {
  const isDoc = doc instanceof mongoose.Document;
  const docObj = isDoc ? doc.toObject() : doc;
  const isNew = isDoc ? false : !!doc.isNew;

  // encrypt all 'crypt' fields
  // on the first level only !
  // does not support nested objects/schemas
  return Promise.all(
    listKeys('crypt', true, schema.obj, ['password'])
      .map(async (field) => {
        if (!_.has(docObj, field)) return field;
        if ((isDoc && doc.isModified(field)) || !isDoc || isNew) {
          return bcrypt.hash(docObj[field], 10).then((hash) => {
            doc[field] = hash;
          });
        }

        return field;
      }),
  );
};

/**
 * Create a Mongoose model by passing :
 * - modelName (with capital first. e.g. User, Aom...)
 * - {
 *     schema: mongoose.Schema,
 *     methods|statics|query: {
 *       func(schema, doc) {},
 *     },
 *     virtuals: {
 *       func(schema, doc, arg0, arg1, ...) {},
 *     }
 *   }
 *
 * @param modelName
 * @param pre
 * @param schema
 * @param methods
 * @param virtuals
 * @param statics
 * @param query
 * @returns {Model}
 */
const modelFactory = (modelName, {
  pre = {},
  schema = {},
  methods = {},
  virtuals = {},
  statics = {},
  query = {},
}) => {
  const S = (schema instanceof mongoose.Schema)
    ? schema
    : new mongoose.Schema(schema);

  // fill out 'pre' middlewares with default names
  pre = _.assign({
    save: [],
    findOneAndUpdate: [],
    updateOne: [],
  }, pre);

  // bind middlewares
  _.map(pre, (list, name) => {
    // add predefined middlewares
    switch (name) {
      case 'save':
      case 'findOneAndUpdate':
      case 'updateOne':
        list = list.concat(saveAndUpdateHook);
        break;
      default:
    }

    if (list.length) {
      S.pre(name, async function (next) {
        // cast 'doc' depending on middleware type
        let doc = this;
        if (middlewares.model.indexOf(name) > -1) {
          doc = this.getUpdate();
        }

        await Promise.all(list.map(fn => fn(schema, doc)));
        next();
      });
    }
  });

  // /**
  //  * pre hooks
  //  * @url https://mongoosejs.com/docs/middleware.html
  //  */
  // S.pre('save', function (next) {
  //   return saveAndUpdateHook(next, schema, this);
  // });
  //
  // // Warning: this.getUpdate() returns only
  // // the update fields. 'this' in the 'save' hook
  // // gets the full Document.
  // S.pre('findOneAndUpdate', function (next) {
  //   return saveAndUpdateHook(next, schema, this.getUpdate());
  // });
  // S.pre('updateOne', function (next) {
  //   return saveAndUpdateHook(next, schema, this.getUpdate());
  // });

  // add methods
  _.map(_.assign({ toJSON, toCSV }, methods), (fn, name) => {
    S.method(name, function (...args) {
      return fn(schema, this, ...args);
    });
  });

  // add statics
  _.map(statics, (fn, name) => {
    S.method(name, function (...args) {
      return fn(schema, this, ...args);
    });
  });

  // add query
  _.map(query, (fn, name) => {
    S.method(name, function (...args) {
      return fn(schema, this, ...args);
    });
  });

  // add virtuals
  _.map(virtuals, (fn, name) => {
    if (!fn.get && !fn.set) return;

    const vir = S.virtual(name);

    if (fn.get) {
      vir.get(function () {
        return fn.get(schema, this);
      });
    }

    if (fn.set) {
      vir.set(function (...args) {
        return fn.set(schema, this, ...args);
      });
    }
  });

  return mongoose.model(modelName, S);
};

module.exports = modelFactory;
