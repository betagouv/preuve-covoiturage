import anyTest from 'ava';

import { selfCheckMacro } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { LowDurationCheck } from './LowDurationCheck';

const { test, range } = selfCheckMacro(anyTest, ServiceProvider, LowDurationCheck);

test('max', range, { passenger_duration: 0 }, 100, 100);
test('min', range, { passenger_duration: 300 }, 0, 0);
test('between', range, { passenger_duration: 150 }, 0, 100);
