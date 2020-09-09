import { macro } from './macro';
import { eventTrafficLimitPolicy } from './eventTrafficLimitPolicy';

const { test, results } = macro({
  ...eventTrafficLimitPolicy,
  territory_id: 1,
  status: 'active',
  start_date: new Date('2019-01-15T00:00:00.000Z'),
  end_date: new Date('2019-01-15T23:59:59.999Z'),
});

test(results, [
  { carpool_id: 10, amount: 0 },
  { carpool_id: 11, amount: 0 },
  { carpool_id: 34, amount: 100 },
  { carpool_id: 35, amount: 50 },
  { carpool_id: 44, amount: 300 },
  { carpool_id: 45, amount: 75 },
  { carpool_id: 54, amount: 2000 },
  { carpool_id: 55, amount: 1000 },
  { carpool_id: 66, amount: 0 },
  { carpool_id: 67, amount: 0 },
]);
