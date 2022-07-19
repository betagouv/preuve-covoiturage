import test from 'ava';

import { StatelessContext } from '../entities/Context';
import { generateCarpool } from '../tests/helpers';
import { onDistanceRange } from './onDistanceRange';

function setup(distance: number) {
  return StatelessContext.fromCarpool(1, generateCarpool({ distance }));
}

test('should return false if not in range', async (t) => {
  const ctx = setup(10);
  const res = onDistanceRange(ctx, { min: 14, max: 16 });
  t.is(res, false);
});

test('should return true if in range', async (t) => {
  const ctx = setup(15);
  const res = onDistanceRange(ctx, { min: 14, max: 16 });
  t.is(res, true);
});
