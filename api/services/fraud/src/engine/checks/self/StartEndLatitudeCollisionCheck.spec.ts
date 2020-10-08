import anyTest from 'ava';

import { selfCheckMacro } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { StartEndLatitudeCollisionCheck } from './StartEndLatitudeCollisionCheck';

const { test, range } = selfCheckMacro(anyTest, ServiceProvider, StartEndLatitudeCollisionCheck);

test('max', range, { driver_start_lat: 48.847218, driver_end_lat: 48.847218 }, 1, 1);
test('min', range, { driver_start_lat: 48.847218, driver_end_lat: 49.857218 }, 0, 0);
test('between', range, { driver_start_lat: 48.847218, driver_end_lat: 48.848218 }, 0, 1);
