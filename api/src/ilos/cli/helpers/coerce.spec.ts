import test from 'ava';
import { coerceIntList, coerceDate } from './coerce.ts';

/**
 * String to list of numbers
 */
test('intList : comma separated ok', (t) => {
  t.deepEqual(coerceIntList('1,2,3'), [1, 2, 3]);
});

test('intList : remove non numbers', (t) => {
  t.deepEqual(coerceIntList('1,2,3,a,b,c'), [1, 2, 3]);
});

test('intList : float to int', (t) => {
  t.deepEqual(coerceIntList('1.1,2.2,3.3'), [1, 2, 3]);
});

test('intList : single number', (t) => {
  t.deepEqual(coerceIntList('1'), [1]);
});

test('intList : empty list', (t) => {
  t.deepEqual(coerceIntList('NaN'), []);
});

test('intList : hexa is ok', (t) => {
  t.deepEqual(coerceIntList('0x10, 0x20'), [16, 32]);
});

/**
 * String to Date or null
 */
test('Date : YYYY-MM-DD UTC', (t) => {
  t.deepEqual(coerceDate('2023-01-01'), new Date('2023-01-01T00:00:00Z'));
});

test('Date : YYYY-MM-DDTHH:MM:SSZ', (t) => {
  t.deepEqual(coerceDate('2023-01-01T00:00:00Z'), new Date('2023-01-01T00:00:00Z'));
});

test('Date : YYYY-MM-DDTHH:MM:SS+0100', (t) => {
  t.deepEqual(coerceDate('2023-01-01T00:00:00+0100'), new Date('2023-01-01T00:00:00+0100'));
});

test('Date : null if not a date', (t) => {
  t.is(coerceDate('abc'), null);
  t.is(coerceDate('1234567890'), null);
});
