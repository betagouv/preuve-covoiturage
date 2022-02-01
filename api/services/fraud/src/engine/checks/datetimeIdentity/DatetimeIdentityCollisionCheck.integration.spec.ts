import anyTest, { TestFn } from 'ava';

import { datetimeIdentityCheckMacro, DatetimeIdentityCheckMacroContext } from './datetimeIdentityCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { DatetimeIdentityCollisionCheck } from './DatetimeIdentityCollisionCheck';

const { before, after, range } = datetimeIdentityCheckMacro(ServiceProvider, DatetimeIdentityCollisionCheck);
const test = anyTest as TestFn<DatetimeIdentityCheckMacroContext>;

test.before(async (t) => {
  const { kernel } = await before();
  t.context.kernel = kernel;
});

test.after.always(async (t) => {
  await after({ kernel: t.context.kernel });
});

test('max', range, [{ inside: true }], 1, 1);
test('min', range, [{ inside: false }], 0, 0);
