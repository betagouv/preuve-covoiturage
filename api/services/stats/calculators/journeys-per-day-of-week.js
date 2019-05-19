const { ObjectId } = require('mongoose').Types;

module.exports = {
  journeysCollectedPerDayOfWeek({ aom = null }) {
    const args = [
      {
        $project: {
          year: { $year: '$passenger.start.datetime' },
          month: { $month: '$passenger.start.datetime' },
          isoDayOfWeek: { $isoDayOfWeek: '$passenger.start.datetime' },
        },
      },
      {
        $group: {
          _id: {
            name: 'journeys_collected_per_day_of_week',
            year: '$year',
            month: '$month',
            isoDayOfWeek: '$isoDayOfWeek',
          },
          total: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.isoDayOfWeek': 1,
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
