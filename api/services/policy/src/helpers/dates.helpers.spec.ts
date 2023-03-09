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
  t.is(castUserStringToUTC('Europe/Paris', undefined), undefined);
  t.is(castUserStringToUTC('Europe/Paris', null), undefined);
  // @ts-expect-error
  t.is(castUserStringToUTC('Europe/Paris', 'kjahdkjhsad'), undefined);
});

test('full form Europe/Paris', (t) => {
  t.is(toISOString(castUserStringToUTC('2023-01-01T00:00:00+0100', 'Europe/Paris')), '2022-12-31T23:00:00.000Z');
  t.is(toTzStringParis(castUserStringToUTC('2023-01-01T00:00:00+0100', 'Europe/Paris')), '2023-01-01T00:00:00+0100');
});

test('full form Indian/Reunion', (t) => {
  t.is(toISOString(castUserStringToUTC('2023-01-01T00:00:00+0400', 'Indian/Reunion')), '2022-12-31T20:00:00.000Z');
  t.is(
    toTzString(castUserStringToUTC('2023-01-01T00:00:00+0400', 'Indian/Reunion'), 'Indian/Reunion'),
    '2023-01-01T00:00:00+0400',
  );
});

test('short form Europe/Paris', (t) => {
  t.is(toISOString(castUserStringToUTC('2023-01-01', 'Europe/Paris')), '2022-12-31T23:00:00.000Z');
  t.is(toTzStringParis(castUserStringToUTC('2023-01-01', 'Europe/Paris')), '2023-01-01T00:00:00+0100');
});

test('short form Indian/Reunion', (t) => {
  t.is(toISOString(castUserStringToUTC('2023-01-01', 'Indian/Reunion')), '2022-12-31T20:00:00.000Z');
  t.is(toTzString(castUserStringToUTC('2023-01-01', 'Indian/Reunion'), 'Indian/Reunion'), '2023-01-01T00:00:00+0400');
});

test('short form Europe/Paris - add/sub days', (t) => {
  const start = castUserStringToUTC('2023-01-01', 'Europe/Paris');
  t.is(toISOString(start), '2022-12-31T23:00:00.000Z');
  t.is(toTzStringParis(start), '2023-01-01T00:00:00+0100');

  t.is(toISOString(addDaysTz(start, 7)), '2023-01-07T23:00:00.000Z');
  t.is(toTzStringParis(addDaysTz(start, 7)), '2023-01-08T00:00:00+0100');

  t.is(toISOString(subDaysTz(start, 7)), '2022-12-24T23:00:00.000Z');
  t.is(toTzStringParis(subDaysTz(start, 7)), '2022-12-25T00:00:00+0100');
});

test('short form Europe/Paris - add months', (t) => {
  const start = castUserStringToUTC('2023-01-01', 'Europe/Paris');
  t.is(toISOString(start), '2022-12-31T23:00:00.000Z');
  t.is(toTzStringParis(start), '2023-01-01T00:00:00+0100');

  t.is(toISOString(addMonthsTz(start, 5)), '2023-05-31T22:00:00.000Z');
  t.is(toTzStringParis(addMonthsTz(start, 5)), '2023-06-01T00:00:00+0200');

  t.is(toISOString(addMonthsTz(start, 12)), '2023-12-31T23:00:00.000Z');
  t.is(toTzStringParis(addMonthsTz(start, 12)), '2024-01-01T00:00:00+0100');
});

test('short form Europe/Paris - startOfMonth 01/01', (t) => {
  const start = castUserStringToUTC('2023-01-01', 'Europe/Paris');
  t.is(toISOString(start), '2022-12-31T23:00:00.000Z');
  t.is(toTzStringParis(start), '2023-01-01T00:00:00+0100');

  t.is(toISOString(startOfMonthTz(start)), '2022-12-31T23:00:00.000Z');
  t.is(toTzStringParis(startOfMonthTz(start)), '2023-01-01T00:00:00+0100');
});

test('short form Europe/Paris - startOfMonth 05/01', (t) => {
  const start = castUserStringToUTC('2023-01-05', 'Europe/Paris');
  t.is(toISOString(start), '2023-01-04T23:00:00.000Z');
  t.is(toTzStringParis(start), '2023-01-05T00:00:00+0100');

  t.is(toISOString(startOfMonthTz(start)), '2022-12-31T23:00:00.000Z');
  t.is(toTzStringParis(startOfMonthTz(start)), '2023-01-01T00:00:00+0100');
});

test('short form Europe/Paris - next startOfMonth 05/01', (t) => {
  const start = castUserStringToUTC('2023-01-05', 'Europe/Paris');
  t.is(toISOString(start), '2023-01-04T23:00:00.000Z');
  t.is(toTzStringParis(start), '2023-01-05T00:00:00+0100');

  t.is(toISOString(addMonthsTz(startOfMonthTz(start), 1)), '2023-01-31T23:00:00.000Z');
  t.is(toTzStringParis(addMonthsTz(startOfMonthTz(start), 1)), '2023-02-01T00:00:00+0100');
});
