import { macro } from './macro';
import { weekdayTrafficLimitPolicy } from './weekdayTrafficLimitPolicy';

const { test, results } = macro({
  ...weekdayTrafficLimitPolicy,
  territory_id: 1,
  status: 'active',
  start_date: new Date('2019-01-01'),
  end_date: new Date('2019-02-01'),
});

test(results, [
  { carpool_id: 10, amount: 0, meta: {} },
  { carpool_id: 11, amount: 0, meta: {} },
  { carpool_id: 34, amount: 0, meta: {} },
  { carpool_id: 35, amount: 0, meta: {} },
  {
    carpool_id: 44,
    amount: 300,
    meta: {
      driver_max_trip_restriction: 'max_trip_restriction.4.day.15-0-2019',
    },
  },
  {
    carpool_id: 45,
    amount: 75,
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
    amount: 500,
    meta: {
      passenger_max_trip_restriction: 'max_trip_restriction.5.day.15-0-2019',
    },
  },
  { carpool_id: 66, amount: 0, meta: {} },
  { carpool_id: 67, amount: 0, meta: {} },
  {
    carpool_id: 74,
    amount: 150,
    meta: {
      driver_max_trip_restriction: 'max_trip_restriction.4.day.17-0-2019',
    },
  },
  {
    carpool_id: 75,
    amount: 75,
    meta: {
      passenger_max_trip_restriction: 'max_trip_restriction.5.day.17-0-2019',
    },
  },
  { carpool_id: 86, amount: 0, meta: {} },
  { carpool_id: 87, amount: 0, meta: {} },
]);
