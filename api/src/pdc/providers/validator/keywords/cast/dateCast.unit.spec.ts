import { anyTest as test } from '@/dev_deps.ts';

import { dateCast } from './dateCast.ts';

test('converts date full ISO', (t) => {
  t.is(dateCast()('2019-01-01T00:00:00Z').toISOString(), new Date('2019-01-01T00:00:00Z').toISOString());
  t.is(dateCast(true)('2019-01-01T00:00:00Z').toISOString(), new Date('2019-01-01T00:00:00Z').toISOString());
});

test('converts date Y-m-d', (t) => {
  t.is(dateCast()('2019-01-01').toISOString(), new Date('2019-01-01').toISOString());
  const err1 = t.throws(() => dateCast(true)('2019-01-01'));
  t.true(err1 instanceof Error);
  t.is(err1.message, 'Invalid Date format');
  const err2 = t.throws(() => dateCast(true)(1));
  t.true(err2 instanceof Error);
  t.is(err2.message, 'Invalid Date format');
});

test('fails string', (t) => {
  t.throws(() => dateCast()('not_a_date'), { instanceOf: Error }, 'Invalid Date');
});

test('fails null', (t) => {
  t.throws(() => dateCast()(null), { instanceOf: Error }, 'Invalid Date');
});

test('fails undefined', (t) => {
  t.throws(() => dateCast()(undefined), { instanceOf: Error }, 'Invalid Date');
});
