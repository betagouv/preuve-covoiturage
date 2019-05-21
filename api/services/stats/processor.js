const { get, set } = require('lodash');
const { ObjectId } = require('mongoose').Types;

const castToObjectId = {
  find: ['aom._id'],
  aggregate: [[0, '$match.aom.$elemMatch._id']],
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
      break;

    case 'aggregate':
      // cast all declared ObjectId
      castToObjectId.aggregate.forEach(([idx, path]) => {
        if (args[idx]) {
          const _id = get(args[idx], path);
          if (_id && ObjectId.isValid(_id)) {
            set(args[idx], path, ObjectId(_id));
          }
        }
      });
      break;
    default:
  }

  return args;
};

module.exports = db => async (job) => {
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
