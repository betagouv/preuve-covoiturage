import anyTest from 'ava';

import { selfCheckMacro } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { StartLatitudeCollisionCheck } from './StartLatitudeCollisionCheck';

const { test, range } = selfCheckMacro(anyTest, ServiceProvider, StartLatitudeCollisionCheck);

test('max', range, { driver_start_lat: 1 }, 1, 1, true);
test('min', range, {}, 0, 0);
test('between', range, { driver_start_lat: 0.5 }, 0, 1, true);
