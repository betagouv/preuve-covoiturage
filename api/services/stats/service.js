const mongoConnection = require('@pdc/proxy/mongo');
const bus = require('./transports/bus');

const { journeysAllTimes } = require('./calculators/journeys-all-times');
const { journeysPerMonth } = require('./calculators/journeys-per-month');
const { journeysPerDay } = require('./calculators/journeys-per-day');

const { distanceAllTimes } = require('./calculators/distance-all-times');
const { distancePerMonth } = require('./calculators/distance-per-month');
const { distancePerDay } = require('./calculators/distance-per-day');

const { durationAllTimes } = require('./calculators/duration-all-times');

const calculator = require('./calculator')(mongoConnection, bus, {
  journeysAllTimes,
  journeysPerMonth,
  journeysPerDay,
  distanceAllTimes,
  distancePerMonth,
  distancePerDay,
  durationAllTimes,
});

module.exports = {
  async getStats(args) {
    return {
      journeys: {
        total: await calculator('journeysAllTimes', args),
        month: await calculator('journeysPerMonth', args),
        day: await calculator('journeysPerDay', args),
      },
      distance: {
        total: await calculator('distanceAllTimes', args),
        month: await calculator('distancePerMonth', args),
        day: await calculator('distancePerDay', args),
      },
      duration: {
        total: await calculator('durationAllTimes', args),
      },
    };
  },
};
