import test from 'ava';

import { dateCast } from './dateCast';

test('converts date full ISO', (t) => {
  t.is(dateCast('2019-01-01T00:00:00Z').toISOString(), new Date('2019-01-01T00:00:00Z').toISOString());
});

test('converts date Y-m-d', (t) => {
  t.is(dateCast('2019-01-01').toISOString(), new Date('2019-01-01').toISOString());
});

test('fails string', (t) => {
  t.throws(() => dateCast('not_a_date'), { instanceOf: Error }, 'Invalid Date');
});

test('fails null', (t) => {
  t.throws(() => dateCast(null), { instanceOf: Error }, 'Invalid Date');
});

test('fails undefined', (t) => {
  t.throws(() => dateCast(undefined), { instanceOf: Error }, 'Invalid Date');
});
