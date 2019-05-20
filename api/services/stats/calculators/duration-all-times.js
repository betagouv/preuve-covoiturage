const { ObjectId } = require('mongoose').Types;

module.exports = {
  durationAllTimes({ aom = null }) {
    const args = [
      {
        $group: {
          _id: {
            name: 'duration',
          },
          total: {
            $sum: '$passenger.duration',
          },
        },
      },
    ];

    if (aom) {
      args.unshift({
        $match: {
          aom: {
            $elemMatch: {
              _id: ObjectId(aom),
            },
          },
        },
      });
    }

    return {
      collection: 'journeys',
      commands: [
        {
          args,
          command: 'aggregate',
        },
        {
          command: 'toArray',
        },
      ],
    };
  },
};
