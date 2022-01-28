import anyTest, { TestFn } from 'ava';

import { selfCheckMacro, SelfCheckMacroContext } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { StartEndLongitudeCollisionCheck } from './StartEndLongitudeCollisionCheck';

const { before, after, range } = selfCheckMacro(ServiceProvider, StartEndLongitudeCollisionCheck);
const test = anyTest as TestFn<SelfCheckMacroContext>;

test.before(async (t) => {
  const { kernel } = await before();
  t.context.kernel = kernel;
});

test.after.always(async (t) => {
  await after({ kernel: t.context.kernel });
});

test('max', range, { driver_start_lon: 2.309339, driver_end_lon: 2.309339 }, 1, 1);
test('min', range, { driver_start_lon: 2.309339, driver_end_lon: 2.410339 }, 0, 0);
test('between', range, { driver_start_lon: 2.309339, driver_end_lon: 2.309439 }, 0, 1);
