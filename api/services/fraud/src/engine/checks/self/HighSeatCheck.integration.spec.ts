import { selfCheckMacro } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { HighSeatCheck } from './HighSeatCheck';

const { test, range } = selfCheckMacro(ServiceProvider, HighSeatCheck);

test('max', range, { passenger_seats: 18 }, 1, 1);
test('min', range, { passenger_seats: 3 }, 0, 0);
test('between', range, { passenger_seats: 5 }, 0, 1);
