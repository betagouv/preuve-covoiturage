import anyTest from 'ava';

import { selfCheckMacro } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { HighDurationCheck } from './HighDurationCheck';

const { test, range } = selfCheckMacro(anyTest, ServiceProvider, HighDurationCheck);

test('max', range, { driver_duration: 432000 }, 1, 1);
test('min', range, { driver_duration: 4200 }, 0, 0);
test('between', range, { driver_duration: 10200 }, 0, 1);
