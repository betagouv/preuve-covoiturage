import test from 'ava';

import { dateCast } from './dateCast';

test('converts date full ISO', (t) =>
  t.deepEqual(dateCast({ data: '2019-01-01T00:00:00Z' }), new Date('2019-01-01T00:00:00Z')));
test('converts date Y-m-d', (t) => t.deepEqual(dateCast({ data: '2019-01-01' }), new Date('2019-01-01T00:00:00Z')));

test('fails string', (t) => {
  t.throws(() => dateCast({ data: 'asd' }), { message: 'Invalid Date' });
});
test('fails null', (t) => {
  t.throws(() => dateCast({ data: null }), { message: 'Invalid Date' });
});
test('fails undefined', (t) => {
  t.throws(() => dateCast({ data: undefined }), { message: 'Invalid Date' });
});
