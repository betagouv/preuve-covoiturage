import test from 'ava';
import sinon from 'sinon';
import { todayFrequencies } from './todayFrequencies.helper.ts';

test('On Monday', (t) => {
  const clock = sinon.useFakeTimers(new Date('2023-02-13'));
  t.deepEqual(todayFrequencies(), ['daily', 'weekly']);
  clock.restore();
});

test('On Tuesday', (t) => {
  const clock = sinon.useFakeTimers(new Date('2023-02-14'));
  t.deepEqual(todayFrequencies(), ['daily']);
  clock.restore();
});

test('On 1st day of the month (not a Monday)', (t) => {
  const clock = sinon.useFakeTimers(new Date('2023-02-01'));
  t.deepEqual(todayFrequencies(), ['daily', 'monthly']);
  clock.restore();
});

test('On 1st day of the month (a Monday)', (t) => {
  const clock = sinon.useFakeTimers(new Date('2022-08-01'));
  t.deepEqual(todayFrequencies(), ['daily', 'weekly', 'monthly']);
  clock.restore();
});
