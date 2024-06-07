import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';

import { dateCast } from './dateCast.ts';

it('converts date full ISO', (t) => {
  assertEquals(dateCast()('2019-01-01T00:00:00Z').toISOString(), new Date('2019-01-01T00:00:00Z').toISOString());
  assertEquals(dateCast(true)('2019-01-01T00:00:00Z').toISOString(), new Date('2019-01-01T00:00:00Z').toISOString());
});

it('converts date Y-m-d', (t) => {
  assertEquals(dateCast()('2019-01-01').toISOString(), new Date('2019-01-01').toISOString());
  const err1 = t.throws(() => dateCast(true)('2019-01-01'));
  assert(err1 instanceof Error);
  assertEquals(err1.message, 'Invalid Date format');
  const err2 = t.throws(() => dateCast(true)(1));
  assert(err2 instanceof Error);
  assertEquals(err2.message, 'Invalid Date format');
});

it('fails string', (t) => {
  t.throws(() => dateCast()('not_a_date'), { instanceOf: Error }, 'Invalid Date');
});

it('fails null', (t) => {
  t.throws(() => dateCast()(null), { instanceOf: Error }, 'Invalid Date');
});

it('fails undefined', (t) => {
  t.throws(() => dateCast()(undefined), { instanceOf: Error }, 'Invalid Date');
});
