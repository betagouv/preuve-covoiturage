import { macro } from './macro';
import { pollutionLimitPolicy } from './pollutionLimitPolicy';

const { test, results } = macro({
  ...pollutionLimitPolicy,
  territory_id: 1,
  status: 'active',
  start_date: new Date('2019-01-15T00:00:00.000Z'),
  end_date: new Date('2019-01-15T23:59:59.999Z'),
});

test(results, [
  { carpool_id: 10, amount: 0, meta: {} },
  { carpool_id: 11, amount: 0, meta: {} },
  {
    carpool_id: 34,
    amount: 100,
    meta: {
      driver_max_trip_restriction: 'max_trip_restriction.4.day.15-0-2019',
    },
  },
  {
    carpool_id: 35,
    amount: 2,
    meta: {
      passenger_max_trip_restriction: 'max_trip_restriction.5.day.15-0-2019',
    },
  },
  {
    carpool_id: 44,
    amount: 300,
    meta: {
      driver_max_trip_restriction: 'max_trip_restriction.4.day.15-0-2019',
    },
  },
  {
    carpool_id: 45,
    amount: 2,
    meta: {
      passenger_max_trip_restriction: 'max_trip_restriction.5.day.15-0-2019',
    },
  },
  {
    carpool_id: 54,
    amount: 1000,
    meta: {
      driver_max_trip_restriction: 'max_trip_restriction.4.day.15-0-2019',
    },
  },
  {
    carpool_id: 55,
    amount: 0,
    meta: {
      passenger_max_trip_restriction: 'max_trip_restriction.5.day.15-0-2019',
    },
  },
  { carpool_id: 66, amount: 0, meta: {} },
  { carpool_id: 67, amount: 0, meta: {} },
]);
