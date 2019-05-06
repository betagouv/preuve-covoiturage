/* eslint-disable no-console,no-undef,camelcase */
const _ = require('lodash');
const moment = require('moment');
const { journeysQueue } = require('@pdc/service-acquisition').acquisition;

module.exports = {
  async up(db) {
    const res = await db
      .collection('safejourneys')
      .find({
        $or: [
          { 'driver.start.datetime': { $not: { $type: 'date' } } },
          { 'driver.end.datetime': { $not: { $type: 'date' } } },
          { 'passenger.start.datetime': { $not: { $type: 'date' } } },
          { 'passenger.end.datetime': { $not: { $type: 'date' } } },
        ],

      }, {
        projection: {
          'driver.start.datetime': 1,
          'driver.end.datetime': 1,
          'passenger.start.datetime': 1,
          'passenger.end.datetime': 1,
        },
      })
      // .limit(200)
      .toArray();

    const touched = [];
    const promises = [];

    res.forEach(async (doc) => {
      const update = [
        'driver.start.datetime',
        'driver.end.datetime',
        'passenger.start.datetime',
        'passenger.end.datetime',
      ].reduce((acc, path) => {
        const dt = _.get(doc, path);
        const dtUtc = moment.utc(dt);
        if (dt && dtUtc.isValid()) {
          acc.$set = acc.$set || {};
          acc.$set[path] = dtUtc.toDate();
        }

        return acc;
      }, {});

      if (update && update.$set) {
        touched.push(doc._id);
        promises.push(
          db
            .collection('safejourneys')
            .findOneAndUpdate({ _id: doc._id }, update)
            .then((resUpdate) => {
              console.log(doc._id.toString(), resUpdate.ok);
              return resUpdate;
            }),
        );
      }
    });

    await Promise.all(promises);

    // re-process all modified safe-journeys
    const journeys = await db
      .collection('journeys')
      .find({
        safe_journey_id: { $in: touched },
        status: { $nin: ['processed'] },
      })
      .toArray();

    const processes = [];
    journeys.forEach(({ safe_journey_id }) => {
      // console.log('add', safe_journey_id);
      processes.push(journeysQueue.add(`process - ${safe_journey_id}`, {
        type: 'process',
        safe_journey_id,
      }));
    });

    await Promise.all(processes);

    console.log(`fixed ${res.length}/${touched.length}/${processes.length}`);

    return res.length;
  },

  // down(db) {
  // no possible down function
  // },
};
