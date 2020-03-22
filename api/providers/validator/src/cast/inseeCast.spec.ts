import test from 'ava';

import { inseeCast } from './inseeCast';

test('cast proper INSEE', (t) => t.deepEqual(inseeCast({ data: '75101' }), '75101'));
test('cast number', (t) => t.deepEqual(inseeCast({ data: 75101 }), '75101'));
test('cast number missing leading 0', (t) => t.deepEqual(inseeCast({ data: 8000 }), '08000'));
test('cast to uppercase', (t) => t.deepEqual(inseeCast({ data: '2a123' }), '2A123'));

test('fails on empty', (t) => {
  t.throws(() => inseeCast({ data: '' }), { message: 'Invalid INSEE code' });
});
test('fails on null', (t) => {
  t.throws(() => inseeCast({ data: null }), { message: 'Invalid INSEE code' });
});
test('fails on undefined', (t) => {
  t.throws(() => inseeCast({ data: undefined }), { message: 'Invalid INSEE code' });
});
