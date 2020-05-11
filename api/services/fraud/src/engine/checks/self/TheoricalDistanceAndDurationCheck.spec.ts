import anyTest from 'ava';

import { selfCheckMacro } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { TheoricalDistanceAndDurationCheck } from './TheoricalDistanceAndDurationCheck';

const { test, range } = selfCheckMacro(anyTest, ServiceProvider, TheoricalDistanceAndDurationCheck);

test('max by distance', range, { driver_distance: 1, driver_calc_distance: 1000 }, 0.99, 1);
test('min by distance', range, {}, 0, 0);
test('between by distance', range, { driver_distance: 500, driver_calc_distance: 1000 }, 0, 1);

test('max by duration', range, { driver_duration: 1, driver_calc_duration: 1000 }, 0.99, 1);
test('min by duration', range, {}, 0, 0);
test('between by duration', range, { driver_duration: 500, driver_calc_duration: 1000 }, 0, 1);

test('max by null duration', range, { driver_duration: 10, driver_calc_duration: 0 }, 0.99, 1);
test('max by null distance', range, { driver_distance: 0, driver_calc_distance: 10 }, 0.99, 1);

