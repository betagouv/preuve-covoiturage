import anyTest, { TestFn } from 'ava';

import { selfCheckMacro, SelfCheckMacroContext } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { LowDurationCheck } from './LowDurationCheck';

const { before, after, range } = selfCheckMacro(ServiceProvider, LowDurationCheck);
const test = anyTest as TestFn<SelfCheckMacroContext>;

test.before(async (t) => {
  const { kernel } = await before();
  t.context.kernel = kernel;
});

test.after.always(async (t) => {
  await after({ kernel: t.context.kernel });
});

test('max', range, { passenger_duration: 0 }, 1, 1);
test('min', range, { passenger_duration: 300 }, 0, 0);
test('between', range, { passenger_duration: 150 }, 0, 1);
