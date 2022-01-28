import anyTest, { TestFn } from 'ava';

import { selfCheckMacro, SelfCheckMacroContext } from './selfCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { StartEndLatitudeCollisionCheck } from './StartEndLatitudeCollisionCheck';

const { before, after, range } = selfCheckMacro(ServiceProvider, StartEndLatitudeCollisionCheck);
const test = anyTest as TestFn<SelfCheckMacroContext>;

test.before(async (t) => {
  const { kernel } = await before();
  t.context.kernel = kernel;
});

test.after.always(async (t) => {
  await after({ kernel: t.context.kernel });
});

test('max', range, { driver_start_lat: 48.847218, driver_end_lat: 48.847218 }, 1, 1);
test('min', range, { driver_start_lat: 48.847218, driver_end_lat: 49.857218 }, 0, 0);
test('between', range, { driver_start_lat: 48.847218, driver_end_lat: 48.848218 }, 0, 1);
