import anyTest from 'ava';

import { selfCheckMacro } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { StartLongitudeCollisionCheck } from './StartLongitudeCollisionCheck';

const { test, range } = selfCheckMacro(anyTest, ServiceProvider, StartLongitudeCollisionCheck);

test('max', range, { driver_start_lon: 1 }, 100, 100, true);
test('min', range, {}, 0, 0);
test('between', range, { driver_start_lon: 0.5 }, 0, 100, true);
