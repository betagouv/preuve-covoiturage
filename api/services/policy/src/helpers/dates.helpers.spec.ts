import test from 'ava';
import {
  addDaysTz,
  addMonthsTz,
  castUserStringToUTC,
  startOfMonthTz,
  subDaysTz,
  toISOString,
  toTzString,
} from './dates.helper';

function toTzStringParis(d: Date): string {
  return toTzString(d, 'Europe/Paris');
}

test('marginals', (t) => {
  t.deepEqual(castUserStringToUTC('Europe/Paris', []), []);
  t.deepEqual(castUserStringToUTC('Europe/Paris', [null, null]), []);
  t.deepEqual(castUserStringToUTC('Europe/Paris', [null, 'kjahdkjhsad']), []);
  t.deepEqual(castUserStringToUTC(undefined, [null, '2023-01-01']).map(toISOString), ['2022-12-31T23:00:00.000Z']);
  t.deepEqual(castUserStringToUTC(undefined, ['kasdkjad', '2023-01-01']).map(toISOString), [
    '2022-12-31T23:00:00.000Z',
  ]);
});

test('full form Europe/Paris', (t) => {
  t.deepEqual(castUserStringToUTC('Europe/Paris', ['2023-01-01T00:00:00+0100']).map(toISOString), [
    '2022-12-31T23:00:00.000Z',
  ]);

  t.deepEqual(castUserStringToUTC('Europe/Paris', ['2023-01-01T00:00:00+0100']).map(toTzStringParis), [
    '2023-01-01T00:00:00+0100',
  ]);

  // regular use of the function
  const [start, end] = castUserStringToUTC('Europe/Paris', ['2023-01-01T00:00:00+0100', '2023-06-01T00:00:00+0200']);
  t.is(toISOString(start), '2022-12-31T23:00:00.000Z');
  t.is(toISOString(end), '2023-05-31T22:00:00.000Z');
});

test('full form Indian/Reunion', (t) => {
  t.deepEqual(castUserStringToUTC('Indian/Reunion', ['2023-01-01T00:00:00+0400']).map(toISOString), [
    '2022-12-31T20:00:00.000Z',
  ]);
  t.deepEqual(castUserStringToUTC('Indian/Reunion', ['2023-01-01T00:00:00+0400']).map(toISOString), [
    '2022-12-31T20:00:00.000Z',
  ]);

  // regular use of the function
  const [start, end] = castUserStringToUTC('Indian/Reunion', ['2023-01-01T00:00:00+0400', '2023-06-01T00:00:00+0400']);
  t.is(toISOString(start), '2022-12-31T20:00:00.000Z');
  t.is(toISOString(end), '2023-05-31T20:00:00.000Z');
});

test('short form Europe/Paris', (t) => {
  t.deepEqual(castUserStringToUTC('Europe/Paris', ['2023-01-01']).map(toISOString), ['2022-12-31T23:00:00.000Z']);

  // regular use of the function
  const [start, end] = castUserStringToUTC('Europe/Paris', ['2023-01-01', '2023-06-01']);
  t.is(toISOString(start), '2022-12-31T23:00:00.000Z');
  t.is(toISOString(end), '2023-05-31T22:00:00.000Z');
});

test('short form Indian/Reunion', (t) => {
  t.deepEqual(castUserStringToUTC('Indian/Reunion', ['2023-01-01']).map(toISOString), ['2022-12-31T20:00:00.000Z']);

  // regular use of the function
  const [start, end] = castUserStringToUTC('Indian/Reunion', ['2023-01-01', '2023-06-01']);
  t.is(toISOString(start), '2022-12-31T20:00:00.000Z');
  t.is(toISOString(end), '2023-05-31T20:00:00.000Z');
});

test('short form Europe/Paris - add/sub days', (t) => {
  const [start] = castUserStringToUTC('Europe/Paris', ['2023-01-01']);
  t.is(toISOString(start), '2022-12-31T23:00:00.000Z');
  t.is(toTzStringParis(start), '2023-01-01T00:00:00+0100');

  t.is(toISOString(addDaysTz(start, 7)), '2023-01-07T23:00:00.000Z');
  t.is(toTzStringParis(addDaysTz(start, 7)), '2023-01-08T00:00:00+0100');

  t.is(toISOString(subDaysTz(start, 7)), '2022-12-24T23:00:00.000Z');
  t.is(toTzStringParis(subDaysTz(start, 7)), '2022-12-25T00:00:00+0100');
});

test('short form Europe/Paris - add months', (t) => {
  const [start] = castUserStringToUTC('Europe/Paris', ['2023-01-01']);
  t.is(toISOString(start), '2022-12-31T23:00:00.000Z');
  t.is(toTzStringParis(start), '2023-01-01T00:00:00+0100');

  t.is(toISOString(addMonthsTz(start, 5)), '2023-05-31T22:00:00.000Z');
  t.is(toTzStringParis(addMonthsTz(start, 5)), '2023-06-01T00:00:00+0200');

  t.is(toISOString(addMonthsTz(start, 12)), '2023-12-31T23:00:00.000Z');
  t.is(toTzStringParis(addMonthsTz(start, 12)), '2024-01-01T00:00:00+0100');
});

test('short form Europe/Paris - startOfMonth 01/01', (t) => {
  const [start] = castUserStringToUTC('Europe/Paris', ['2023-01-01']);
  t.is(toISOString(start), '2022-12-31T23:00:00.000Z');
  t.is(toTzStringParis(start), '2023-01-01T00:00:00+0100');

  t.is(toISOString(startOfMonthTz(start)), '2022-12-31T23:00:00.000Z');
  t.is(toTzStringParis(startOfMonthTz(start)), '2023-01-01T00:00:00+0100');
});

test('short form Europe/Paris - startOfMonth 05/01', (t) => {
  const [start] = castUserStringToUTC('Europe/Paris', ['2023-01-05']);
  t.is(toISOString(start), '2023-01-04T23:00:00.000Z');
  t.is(toTzStringParis(start), '2023-01-05T00:00:00+0100');

  t.is(toISOString(startOfMonthTz(start)), '2022-12-31T23:00:00.000Z');
  t.is(toTzStringParis(startOfMonthTz(start)), '2023-01-01T00:00:00+0100');
});

test('short form Europe/Paris - next startOfMonth 05/01', (t) => {
  const [start] = castUserStringToUTC('Europe/Paris', ['2023-01-05']);
  t.is(toISOString(start), '2023-01-04T23:00:00.000Z');
  t.is(toTzStringParis(start), '2023-01-05T00:00:00+0100');

  t.is(toISOString(addMonthsTz(startOfMonthTz(start), 1)), '2023-01-31T23:00:00.000Z');
  t.is(toTzStringParis(addMonthsTz(startOfMonthTz(start), 1)), '2023-02-01T00:00:00+0100');
});
