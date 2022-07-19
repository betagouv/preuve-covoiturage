import test from 'ava';

import { StatelessContext } from '../entities/Context';
import { generateCarpool } from '../tests/helpers';
import { perSeat, perKm } from './per';

function setup(distance: number, seats: number) {
  return StatelessContext.fromCarpool(1, generateCarpool({ distance, seats }));
}

test('should multiply by seats', async (t) => {
  const ctx = setup(1, 2);
  const res = perSeat(ctx, 20);
  t.is(res, 2 * 20);
});

test('should multiply by seats or one', async (t) => {
  const ctx = setup(1, 0);
  const res = perSeat(ctx, 20);
  t.is(res, 1 * 20);
});

test('should multiply by km', async (t) => {
  const ctx = setup(10000, 1);
  const res = perKm(ctx, { amount: 20 });
  t.is(res, 10 * 20);
});

test('should multiply by km with offset', async (t) => {
  const ctx = setup(10000, 1);
  const res = perKm(ctx, { amount: 20, offset: 3000 });
  t.is(res, 7 * 20);
});

test('should multiply by km with limit', async (t) => {
  const ctx = setup(10000, 1);
  const res = perKm(ctx, { amount: 20, limit: 2000 });
  t.is(res, 2 * 20);
});

test('should multiply by km with offset and limit', async (t) => {
  const ctx = setup(10000, 1);
  const res = perKm(ctx, { amount: 20, offset: 1000, limit: 8000 });
  t.is(res, 8 * 20);
});
