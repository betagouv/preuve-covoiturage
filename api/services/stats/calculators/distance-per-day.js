const { ObjectId } = require('mongoose').Types;

module.exports = {
  distancePerDay({ aom = null }) {
    const args = [
      {
        $project: {
          year: { $year: '$passenger.start.datetime' },
          month: { $month: '$passenger.start.datetime' },
          day: { $dayOfMonth: '$passenger.start.datetime' },
          distance: '$passenger.distance',
        },
      },
      {
        $group: {
          _id: {
            name: 'distance_per_month',
            year: '$year',
            month: '$month',
            day: '$day',
          },
          total: { $sum: '$distance' },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1,
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
