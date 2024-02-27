import test from 'ava';

import { StatelessContext } from '../entities/Context';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import { generateCarpool } from '../tests/helpers';
import { onDistanceRange, onDistanceRangeOrThrow } from './onDistanceRange';

function setup(distance: number) {
  return StatelessContext.fromCarpool(1, generateCarpool({ distance }));
}

test('should return false if under range', async (t) => {
  const ctx = setup(10);
  const res = onDistanceRange(ctx, { min: 14, max: 16 });
  t.is(res, false);
});

test('should return false if above range', async (t) => {
  const ctx = setup(20);
  const res = onDistanceRange(ctx, { min: 14, max: 16 });
  t.is(res, false);
});

test('should return true if in range', async (t) => {
  const ctx = setup(15);
  const res = onDistanceRange(ctx, { min: 14, max: 16 });
  t.is(res, true);
});

test('should not throw if in range', async (t) => {
  const ctx = setup(15);
  t.notThrows(() => onDistanceRangeOrThrow(ctx, { min: 14, max: 16 }));
});

test('should throw if not in range', async (t) => {
  const ctx = setup(20);
  t.throws(() => onDistanceRangeOrThrow(ctx, { min: 14, max: 16 }), { instanceOf: NotEligibleTargetException });
});
