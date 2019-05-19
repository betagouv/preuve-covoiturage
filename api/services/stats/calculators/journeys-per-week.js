const { ObjectId } = require('mongoose').Types;

module.exports = {
  journeysCollectedPerWeek({ aom = null }) {
    const args = [
      {
        $project: {
          year: { $year: '$passenger.start.datetime' },
          month: { $month: '$passenger.start.datetime' },
          week: { $week: '$passenger.start.datetime' },
        },
      },
      {
        $group: {
          _id: {
            name: 'journeys_collected_per_week',
            year: '$year',
            month: '$month',
            week: '$week',
          },
          total: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.week': 1,
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
