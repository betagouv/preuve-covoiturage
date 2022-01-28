import anyTest, { TestFn } from 'ava';

import { selfCheckMacro, SelfCheckMacroContext } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { StartLongitudeCollisionCheck } from './StartLongitudeCollisionCheck';

const { before, after, range } = selfCheckMacro(ServiceProvider, StartLongitudeCollisionCheck);
const test = anyTest as TestFn<SelfCheckMacroContext>;

test.before(async (t) => {
  const { kernel } = await before();
  t.context.kernel = kernel;
});

test.after.always(async (t) => {
  await after({ kernel: t.context.kernel });
});

test('max', range, { driver_start_lon: 1 }, 1, 1, true);
test('min', range, {}, 0, 0);
test('between', range, { driver_start_lon: 0.5 }, 0, 1, true);
