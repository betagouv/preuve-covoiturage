import anyTest from 'ava';

import { selfCheckMacro } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { TheoricalDistanceAndDurationCheck } from './TheoricalDistanceAndDurationCheck';

const { test, range } = selfCheckMacro(anyTest, ServiceProvider, TheoricalDistanceAndDurationCheck);

test('max by distance', range, { driver_distance: 1, driver_calc_distance: 1000 }, 99, 100);
test('min by distance', range, { }, 0, 0);
test('between by distance', range, { driver_distance: 500, driver_calc_distance: 1000 }, 0, 100);

test('max by duration', range, { driver_duration: 1, driver_calc_duration: 1000 }, 99, 100);
test('min by duration', range, { }, 0, 0);
test('between by duration', range, { driver_duration: 500, driver_calc_duration: 1000 }, 0, 100);
