const mongoConnection = require('@pdc/proxy/mongo');
const bus = require('./transports/bus');

const { journeysCollectedAllTimes } = require('./calculators/journeys-all-times');
const { journeysCollectedPerDay } = require('./calculators/journeys-per-day');

const { distanceAllTimes } = require('./calculators/distance-all-times');
const { distancePerDay } = require('./calculators/distance-per-day');

const { durationAllTimes } = require('./calculators/duration-all-times');
const { durationPerDay } = require('./calculators/duration-per-day');

const calculator = require('./calculator')(mongoConnection, bus, {
  journeysCollectedAllTimes,
  journeysCollectedPerDay,
  distanceAllTimes,
  distancePerDay,
  durationAllTimes,
  durationPerDay,
});

module.exports = {
  async getStats(args) {
    return {
      collected: {
        total: await calculator('journeysCollectedAllTimes', args),
        day: await calculator('journeysCollectedPerDay', args),
      },
      distance: {
        total: await calculator('distanceAllTimes', args),
        day: await calculator('distancePerDay', args),
      },
      duration: {
        total: await calculator('durationAllTimes', args),
        day: await calculator('durationPerDay', args),
      },
    };
  },
};
