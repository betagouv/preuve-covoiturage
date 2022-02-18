import { selfCheckMacro } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { TheoricalDistanceAndDurationCheck } from './TheoricalDistanceAndDurationCheck';

const { test, range } = selfCheckMacro(ServiceProvider, TheoricalDistanceAndDurationCheck);

test('max by distance', range, { driver_distance: 1, driver_calc_distance: 1000 }, 0.99, 1);
test('min by distance', range, {}, 0, 0);
test('between by distance', range, { driver_distance: 500, driver_calc_distance: 1000 }, 0, 1);

test('max by duration', range, { driver_duration: 1, driver_calc_duration: 1000 }, 0.99, 1);
test('min by duration', range, {}, 0, 0);
test('between by duration', range, { driver_duration: 500, driver_calc_duration: 1000 }, 0, 1);

test('max by null duration', range, { driver_duration: 10, driver_calc_duration: 0 }, 0.99, 1);
test('between by null distance', range, { driver_distance: 0, driver_calc_distance: 10 }, 0.4, 0.6);

test(
  'should be deactivate in COM 97',
  range,
  { driver_end_geocode: '97501', driver_duration: 1, driver_calc_duration: 1000 },
  0,
  0,
);
test(
  'should be deactivate in COM 98',
  range,
  { passenger_end_geocode: '98501', passenger_duration: 1, passenger_calc_duration: 1000 },
  0,
  0,
);
