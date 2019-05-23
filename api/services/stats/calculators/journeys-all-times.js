module.exports = {
  journeysAllTimes({ aom = null, startDate = '2019-01-01T00:00:00Z' }) {
    const args = {
      'passenger.start.datetime': { $gte: startDate },
    };

    if (aom) args['aom._id'] = aom;

    return {
      collection: 'journeys',
      commands: [
        {
          args,
          command: 'find',
        },
        {
          command: 'count',
        },
      ],
    };
  },
};
