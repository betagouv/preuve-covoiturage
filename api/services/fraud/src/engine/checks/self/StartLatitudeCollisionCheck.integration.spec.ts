import anyTest, { TestFn } from 'ava';

import { selfCheckMacro, SelfCheckMacroContext } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { StartLatitudeCollisionCheck } from './StartLatitudeCollisionCheck';

const { before, after, range } = selfCheckMacro(ServiceProvider, StartLatitudeCollisionCheck);
const test = anyTest as TestFn<SelfCheckMacroContext>;

test.before(async (t) => {
  const { kernel } = await before();
  t.context.kernel = kernel;
});

test.after.always(async (t) => {
  await after({ kernel: t.context.kernel });
});

test('max', range, { driver_start_lat: 1 }, 1, 1, true);
test('min', range, {}, 0, 0);
test('between', range, { driver_start_lat: 0.5 }, 0, 1, true);
