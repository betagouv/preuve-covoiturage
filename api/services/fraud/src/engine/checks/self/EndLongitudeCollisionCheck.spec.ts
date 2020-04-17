import anyTest from 'ava';

import { selfCheckMacro } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { EndLongitudeCollisionCheck } from './EndLongitudeCollisionCheck';

const { test, range } = selfCheckMacro(anyTest, ServiceProvider, EndLongitudeCollisionCheck);

test('max', range, { driver_end_lon: 1 }, 100, 100, true);
test('min', range, { driver_end_lon: 0 }, 0, 0, true);
test('between', range, { driver_end_lon: 0.5 }, 0, 100, true);
