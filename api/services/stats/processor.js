/* eslint-disable no-param-reassign */
const { ObjectId } = require('mongoose').Types;

/**
 * Get the value with a path as array
 * @param {object} obj
 * @param {array} path
 */
const get = (obj, path = []) => {
  const len = path.length;
  return path.reduce((p, c, i) => {
    if (i === len - 1) return p[c];
    if (p && p[c]) p = p[c];
    return p;
  }, obj);
};

/**
 * Set the value with a path as array
 * @param {object} obj
 * @param {array} path
 * @param {*} value
 */
const set = (obj, path = [], value) => {
  const len = path.length;
  return path.reduce((p, c, i) => {
    if (i === len - 1) {
      p[c] = value;
      return obj;
    }

    if (p && p[c]) p = p[c];
    return p;
  }, obj);
};

const castToObjectId = {
  find: [['aom._id']],
  aggregate: [[0, '$match', 'aom._id']],
};

const castToISODate = {
  find: [['passenger.start.datetime', '$gte'], ['passenger.start.datetime', '$lt']],
  aggregate: [[0, '$match', 'passenger.start.datetime', '$gte'], [0, '$match', 'passenger.start.datetime', '$lt']],
};

const castArgs = (command, args) => {
  switch (command) {
    case 'find':
      castToObjectId.find.forEach((path) => {
        const _id = get(args, path);
        if (_id && ObjectId.isValid(_id)) {
          set(args, path, ObjectId(_id));
        }
      });

      castToISODate.find.forEach((path) => {
        const date = get(args, path);
        if (date) set(args, path, new Date(date));
      });
      break;

    case 'aggregate':
      castToObjectId.aggregate.forEach((path) => {
        const _id = get(args, path);
        if (_id && ObjectId.isValid(_id)) {
          set(args, path, ObjectId(_id));
        }
      });

      castToISODate.aggregate.forEach((path) => {
        const date = get(args, path);
        if (date) set(args, path, new Date(date));
      });
      break;
    default:
  }

  return args;
};

module.exports = (db) => async (job) => {
  const { key, collection, commands } = job.data;

  const cache = await commands.reduce(
    (acc, { command, args }) => acc[command](castArgs(command, args)),
    db.collection(collection),
  );

  const value = JSON.stringify(cache);

  await db
    .collection('statistics')
    .updateOne(
      { key, coll: collection },
      { $set: { key, value, coll: collection, updatedAt: new Date() } },
      { upsert: 1 },
    );
};
