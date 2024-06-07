import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { coerceIntList, coerceDate } from './coerce.ts';

/**
 * String to list of numbers
 */
it('intList : comma separated ok', (t) => {
  assertObjectMatch(coerceIntList('1,2,3'), [1, 2, 3]);
});

it('intList : remove non numbers', (t) => {
  assertObjectMatch(coerceIntList('1,2,3,a,b,c'), [1, 2, 3]);
});

it('intList : float to int', (t) => {
  assertObjectMatch(coerceIntList('1.1,2.2,3.3'), [1, 2, 3]);
});

it('intList : single number', (t) => {
  assertObjectMatch(coerceIntList('1'), [1]);
});

it('intList : empty list', (t) => {
  assertObjectMatch(coerceIntList('NaN'), []);
});

it('intList : hexa is ok', (t) => {
  assertObjectMatch(coerceIntList('0x10, 0x20'), [16, 32]);
});

/**
 * String to Date or null
 */
it('Date : YYYY-MM-DD UTC', (t) => {
  assertObjectMatch(coerceDate('2023-01-01'), new Date('2023-01-01T00:00:00Z'));
});

it('Date : YYYY-MM-DDTHH:MM:SSZ', (t) => {
  assertObjectMatch(coerceDate('2023-01-01T00:00:00Z'), new Date('2023-01-01T00:00:00Z'));
});

it('Date : YYYY-MM-DDTHH:MM:SS+0100', (t) => {
  assertObjectMatch(coerceDate('2023-01-01T00:00:00+0100'), new Date('2023-01-01T00:00:00+0100'));
});

it('Date : null if not a date', (t) => {
  assertEquals(coerceDate('abc'), null);
  assertEquals(coerceDate('1234567890'), null);
});
