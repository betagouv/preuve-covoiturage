import test from 'ava';

import { StatelessContext } from '../entities/Context';
import { generateCarpool } from '../tests/helpers';
import { ensureFreeRide } from './ensureFreeRide';

function setup(cost: number) {
  return StatelessContext.fromCarpool(1, generateCarpool({ cost }));
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
