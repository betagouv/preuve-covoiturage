import anyTest from 'ava';

import { selfCheckMacro } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { HighSeatCheck } from './HighSeatCheck';

const { test, range } = selfCheckMacro(anyTest, ServiceProvider, HighSeatCheck);

test('max', range, { passenger_seats: 8 }, 100, 100);
test('min', range, { passenger_seats: 3 }, 0, 0);
test('between', range, { passenger_seats: 6 }, 0, 100);
