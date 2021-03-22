import anyTest from 'ava';

import { selfCheckMacro } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { StartEndLongitudeCollisionCheck } from './StartEndLongitudeCollisionCheck';

const { test, range } = selfCheckMacro(anyTest, ServiceProvider, StartEndLongitudeCollisionCheck);

test('max', range, { driver_start_lon: 2.309339, driver_end_lon: 2.309339 }, 1, 1);
test('min', range, { driver_start_lon: 2.309339, driver_end_lon: 2.410339 }, 0, 0);
test('between', range, { driver_start_lon: 2.309339, driver_end_lon: 2.309439 }, 0, 1);
