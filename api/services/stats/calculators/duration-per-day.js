const { ObjectId } = require('mongoose').Types;

module.exports = {
  durationPerDay({ aom = null }) {
    const args = [
      {
        $project: {
          year: { $year: '$passenger.start.datetime' },
          month: { $month: '$passenger.start.datetime' },
          day: { $dayOfMonth: '$passenger.start.datetime' },
          duration: '$passenger.duration',
        },
      },
      {
        $group: {
          _id: {
            name: 'duration_per_month',
            year: '$year',
            month: '$month',
            day: '$day',
          },
          total: { $sum: '$duration' },
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
