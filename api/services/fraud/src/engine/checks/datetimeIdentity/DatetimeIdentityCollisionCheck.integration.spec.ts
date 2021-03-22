import anyTest from 'ava';

import { datetimeIdentityCheckMacro } from './datetimeIdentityCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { DatetimeIdentityCollisionCheck } from './DatetimeIdentityCollisionCheck';

const { test, range } = datetimeIdentityCheckMacro(anyTest, ServiceProvider, DatetimeIdentityCollisionCheck);

test('max', range, [{ inside: true }], 1, 1);
test('min', range, [{ inside: false }], 0, 0);
