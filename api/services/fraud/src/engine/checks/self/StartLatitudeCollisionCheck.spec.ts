import anyTest from 'ava';

import { selfCheckMacro } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { StartLatitudeCollisionCheck } from './StartLatitudeCollisionCheck';

const { test, range } = selfCheckMacro(anyTest, ServiceProvider, StartLatitudeCollisionCheck);

test('max', range, { driver_start_lat: 1 }, 100, 100, true);
test('min', range, { }, 0, 0);
test('between', range, { driver_start_lat: 0.5 }, 0, 100, true);
