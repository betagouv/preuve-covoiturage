import test from 'ava';

import { StatelessContext } from '../entities/Context';
import { generateCarpool } from '../tests/helpers';
import { atTime } from './atTime';

function setup(datetime: Date) {
  return StatelessContext.fromCarpool(1, generateCarpool({ datetime }));
}

test('should return false if not in range', async (t) => {
  const ctx = setup(new Date('2022-01-01T10:00:00.000Z'));
  const res = atTime(ctx, { start: 14, end: 16 });
  t.is(res, false);
});

test('should return true if in range', async (t) => {
  const ctx = setup(new Date('2022-01-01T15:00:00.000Z'));
  const res = atTime(ctx, { start: 14, end: 16 });
  t.is(res, true);
});
