import test from 'ava';

import { datetimeIdentityCheckMacro } from './datetimeIdentityCheckMacro';
import { ServiceProvider } from '../../../ServiceProvider';
import { DatetimeIdentityCollisionCheck } from './DatetimeIdentityCollisionCheck';

const { before, after, range } = datetimeIdentityCheckMacro(ServiceProvider, DatetimeIdentityCollisionCheck);

test.before(before);
test.after.always(after);

test('max', range, [{ inside: true }], 1, 1);
test('min', range, [{ inside: false }], 0, 0);
