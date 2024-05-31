import test from 'ava';

import { StatelessContext } from '../entities/Context.ts';
import { generateCarpool } from '../tests/helpers.ts';
import { ensureFreeRide } from './ensureFreeRide.ts';

function setup(driver_revenue: number) {
  return StatelessContext.fromCarpool(1, generateCarpool({ driver_revenue }));
}

test('should be equal to difference', async (t) => {
  const ctx = setup(100);
  const res = ensureFreeRide(ctx, 20);
  t.is(res, 80);
});

test('should be null', async (t) => {
  const ctx = setup(100);
  const res = ensureFreeRide(ctx, 120);
  t.is(res, 0);
});
