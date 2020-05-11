import anyTest from 'ava';

import { datetimeIdentityCheckMacro } from './datetimeIdentityCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { DatetimeIdentitySequenceCheck } from './DatetimeIdentitySequenceCheck';

const { test, range } = datetimeIdentityCheckMacro(anyTest, ServiceProvider, DatetimeIdentitySequenceCheck);

test('max', range, [{ interval: 0 }], 1, 1);
test('min', range, [{ interval: 600 }], 0, 0);
test('between', range, [{ interval: 300 }], 0.4, 0.6);
