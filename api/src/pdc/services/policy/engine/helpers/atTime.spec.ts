import { anyTest as test } from '@/dev_deps.ts';

import { StatelessContext } from '../entities/Context.ts';
import { generateCarpool } from '../tests/helpers.ts';
import { atTime } from './atTime.ts';

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
