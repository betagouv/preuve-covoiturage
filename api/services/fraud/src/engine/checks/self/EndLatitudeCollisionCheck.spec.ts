import anyTest from 'ava';

import { selfCheckMacro } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { EndLatitudeCollisionCheck } from './EndLatitudeCollisionCheck';

const { test, range } = selfCheckMacro(anyTest, ServiceProvider, EndLatitudeCollisionCheck);

test('max', range, { driver_end_lat: 1 }, 100, 100, true);
test('min', range, { driver_end_lat: 0 }, 0, 0, true);
test('between', range, { driver_end_lat: 0.5 }, 0, 100, true);
