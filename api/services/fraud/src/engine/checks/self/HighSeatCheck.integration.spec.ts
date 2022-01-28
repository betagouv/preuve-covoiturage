import anyTest, { TestFn } from 'ava';

import { selfCheckMacro, SelfCheckMacroContext } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { HighSeatCheck } from './HighSeatCheck';

const { before, after, range } = selfCheckMacro(ServiceProvider, HighSeatCheck);
const test = anyTest as TestFn<SelfCheckMacroContext>;

test.before(async (t) => {
  const { kernel } = await before();
  t.context.kernel = kernel;
});

test.after.always(async (t) => {
  await after({ kernel: t.context.kernel });
});

test('max', range, { passenger_seats: 18 }, 1, 1);
test('min', range, { passenger_seats: 3 }, 0, 0);
test('between', range, { passenger_seats: 5 }, 0, 1);
