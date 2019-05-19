const { ObjectId } = require('mongoose').Types;

module.exports = {
  journeysCollectedAllTimes({ aom = null }) {
    const findArgs = aom ? { 'aom._id': ObjectId(aom) } : {};

    return {
      collection: 'journeys',
      commands: [
        {
          command: 'find',
          args: findArgs,
        },
        {
          command: 'count',
        },
      ],
    };
  },
};
