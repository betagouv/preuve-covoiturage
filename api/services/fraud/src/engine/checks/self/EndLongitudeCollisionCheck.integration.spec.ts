import anyTest, { TestFn } from 'ava';

import { selfCheckMacro, SelfCheckMacroContext } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { EndLongitudeCollisionCheck } from './EndLongitudeCollisionCheck';

const { before, after, range } = selfCheckMacro(ServiceProvider, EndLongitudeCollisionCheck);
const test = anyTest as TestFn<SelfCheckMacroContext>;

test.before(async (t) => {
  const { kernel } = await before();
  t.context.kernel = kernel;
});

test.after.always(async (t) => {
  await after({ kernel: t.context.kernel });
});

test('max', range, { driver_end_lon: 1 }, 1, 1, true);
test('min', range, { driver_end_lon: 0 }, 0, 0, true);
test('between', range, { driver_end_lon: 0.5 }, 0, 1, true);
