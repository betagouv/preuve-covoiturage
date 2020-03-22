import test from 'ava';

import { ibanCast } from './ibanCast';

test('cast proper IBAN', (t) => t.deepEqual(ibanCast({ data: 'NL91ABNA0517164300' }), 'NL91ABNA0517164300'));
test('remove spaces', (t) => t.deepEqual(ibanCast({ data: 'nl91 abna 0517 1643 00' }), 'NL91ABNA0517164300'));
test('cast to uppercase', (t) => t.deepEqual(ibanCast({ data: 'nl91abna0517164300' }), 'NL91ABNA0517164300'));

test('fails on empty', (t) => {
  t.throws(() => ibanCast({ data: '' }), { message: 'Invalid IBAN' });
});
test('fails on null', (t) => {
  t.throws(() => ibanCast({ data: null }), { message: 'Invalid IBAN' });
});
test('fails on undefined', (t) => {
  t.throws(() => ibanCast({ data: undefined }), { message: 'Invalid IBAN' });
});
