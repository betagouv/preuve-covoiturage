/* eslint-disable camelcase,no-console,max-len */
const _ = require('lodash');
const moment = require('moment');
const serviceFactory = require('@pdc/shared/providers/mongo/service-factory');
const Journey = require('@pdc/service-acquisition/entities/models/journey');
const Trip = require('./entities/models/trip');

const mapPeople = (journey) => [journey.driver, journey.passenger]
  .filter((p) => !!p)
  .map((p) => (p && _.isFunction(p.toObject) ? p.toObject() : p))
  .map((p, idx) => {
    const is_driver = idx === 0;
    return {
      journey_id: journey.journey_id,
      safe_journey_id: journey.safe_journey_id,

      class: journey.operator_class,
      operator_class: journey.operator_class,
      operator: journey.operator,
      aom: journey.aom,

      is_driver,

      identity: p.identity,

      start: p.start,
      end: p.end,
      distance: p.distance,
      duration: p.duration,

      seats: is_driver ? 1 : p.seats,

      cost: p.cost,
      incentive: p.incentive,
      remaining_fee: p.remaining_fee,
      contribution: p.contribution,
      revenue: p.revenue,
      expense: p.expense,

      validation: journey.validation,
    };
  });

// find the oldest start date
const reduceStartDate = (journey, trip = null) => {
  let arr = [_.get(journey.toObject(), 'driver.start.datetime', null)].filter((i) => !!i);

  if (trip) {
    arr = arr.concat([trip.start]);
  }

  return arr.reduce((p, c) => (p.getTime() < c.getTime() ? p : c), new Date());
};

const createFromJourney = async (journey) => {
  const _startCreateFromJourney = new Date();
  const trip = await new Trip({
    operator_id: journey.operator._id,
    operator_journey_id: journey.operator_journey_id,
    status: 'pending',
    aom: journey.aom,
    start: reduceStartDate(journey),
    people: mapPeople(journey),
  }).save();

  await Journey.findByIdAndUpdate({ _id: journey._id }, { trip_id: trip._id });

  console.log(`>> [trip] complete createFromJourney: ${new Date() - _startCreateFromJourney}ms`);
  return trip;
};

const addJourney = async (journey, sourceTrip) => {
  const _startAddJourney = new Date();

  // extract existing phone number to compare identities
  const phones = _.uniq(
    _.get(sourceTrip.toObject(), 'people', [])
      .map((i) => _.get(i, 'identity.phone', null))
      .filter((i) => !!i),
  );

  // filter mapped people by their phone number. Keep non matching ones
  const people = mapPeople(journey).filter((person) => phones.indexOf(person.identity.phone) === -1);

  // push the list of people to the trip
  const trip = await Trip.findByIdAndUpdate(
    { _id: sourceTrip._id },
    {
      $push: { people },
      start: reduceStartDate(journey, sourceTrip),
    },
    { new: true },
  ).exec();

  await Journey.findByIdAndUpdate({ _id: journey._id }, { trip_id: trip._id });

  console.log(`>> [trip] complete addJourney: ${new Date() - _startAddJourney}ms`);
  return trip;
};

const detectors = {
  async operatorJourneyId(journey) {
    return Trip.findOne({
      operator_journey_id: journey.operator_journey_id || { $exists: true },
      operator_id: journey.operator._id,
    }).exec();
  },
  async driverIdentity(journey) {
    const startTime = _.get(journey.toObject(), 'driver.start.datetime');

    return Trip.findOne({
      'people.identity.phone': _.get(journey, 'driver.identity.phone', null),
      'people.is_driver': true,
      start: {
        $gte: moment
          .utc(startTime)
          .subtract(2, 'h')
          .toDate(),
        $lte: moment
          .utc(startTime)
          .add(2, 'h')
          .toDate(),
      },
    }).exec();
  },
};

const tripService = serviceFactory(Trip, {
  async consolidate(journey) {
    // find by operator_journey_id + operator._id
    // find by driver data.phone + position insee + time range

    // apply all detectors and get the last trip from the list
    // returns null if no trip is found
    const _startDetectorOperatorJourneyId = new Date();
    let trip = await detectors.operatorJourneyId(journey);
    console.log(`>> [trip] search by op journey id: ${new Date() - _startDetectorOperatorJourneyId}ms`);

    if (!trip) {
      const _startDetectorDriverIdentity = new Date();
      trip = await detectors.driverIdentity(journey);
      console.log(`>> [trip] search by driver identity: ${new Date() - _startDetectorDriverIdentity}ms`);
    }

    // const trip =
    //   (await Promise.all(
    //     ['operatorJourneyId', 'driverIdentity'].reduce((p, c, idx) => {
    //       if (_.isFunction(detectors[c])) {
    //         // eslint-disable-next-line no-param-reassign
    //         p[idx] = detectors[c](journey);
    //       }

    //       return p;
    //     }, []),
    //   ))
    //     .filter((p) => !!p)
    //     .pop() || null;

    if (!trip) {
      return createFromJourney(journey);
    }

    return addJourney(journey, trip);
  },
});

module.exports = tripService;
