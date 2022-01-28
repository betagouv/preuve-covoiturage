import anyTest, { TestFn } from 'ava';

import { selfCheckMacro, SelfCheckMacroContext } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { HighDurationCheck } from './HighDurationCheck';

const { before, after, range } = selfCheckMacro(ServiceProvider, HighDurationCheck);
const test = anyTest as TestFn<SelfCheckMacroContext>;

test.before(async (t) => {
  const { kernel } = await before();
  t.context.kernel = kernel;
});

test.after.always(async (t) => {
  await after({ kernel: t.context.kernel });
});

test('max', range, { driver_duration: 432000 }, 1, 1);
test('min', range, { driver_duration: 4200 }, 0, 0);
test('between', range, { driver_duration: 10200 }, 0, 1);
