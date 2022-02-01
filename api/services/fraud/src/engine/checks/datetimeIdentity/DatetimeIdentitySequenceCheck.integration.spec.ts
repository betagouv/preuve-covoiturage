import anyTest, { TestFn } from 'ava';

import { datetimeIdentityCheckMacro, DatetimeIdentityCheckMacroContext } from './datetimeIdentityCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { DatetimeIdentitySequenceCheck } from './DatetimeIdentitySequenceCheck';

const { before, after, range } = datetimeIdentityCheckMacro(ServiceProvider, DatetimeIdentitySequenceCheck);
const test = anyTest as TestFn<DatetimeIdentityCheckMacroContext>;

test.before(async (t) => {
  const { kernel } = await before();
  t.context.kernel = kernel;
});

test.after.always(async (t) => {
  await after({ kernel: t.context.kernel });
});

test('max', range, [{ interval: 0 }], 1, 1);
test('min', range, [{ interval: 600 }], 0, 0);
test('between', range, [{ interval: 300 }], 0.4, 0.6);
