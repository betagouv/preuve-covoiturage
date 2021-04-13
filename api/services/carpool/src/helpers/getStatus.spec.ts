import test from 'ava';
import { getStatus } from './getStatus';

test('should have ok status', (t) => {
  const created = new Date('2020-05-20T10:00:00.000Z');
  const dates = [
    new Date('2020-05-16T10:00:00.000Z'),
    new Date('2020-05-17T10:00:00.000Z'),
    new Date('2020-05-18T10:00:00.000Z'),
  ];
  t.is(getStatus(created, dates, 1000 * 60 * 60 * 24 * 5), 'ok');
});

test('should have expired status', (t) => {
  const created = new Date('2020-05-20T10:00:00.000Z');
  const dates = [
    new Date('2020-05-16T10:00:00.000Z'),
    new Date('2020-05-13T10:00:00.000Z'),
    new Date('2020-05-18T10:00:00.000Z'),
  ];
  t.is(getStatus(created, dates, 1000 * 60 * 60 * 24 * 5), 'expired');
});
