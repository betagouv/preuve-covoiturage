import test from 'ava';

import { StatelessContext } from '../entities/Context';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import { generateCarpool } from '../tests/helpers';
import { isDriverOrThrow } from './isDriver';

function setup(is_driver: boolean) {
  return StatelessContext.fromCarpool(1, generateCarpool({ is_driver }));
}

test('should throw if not a driver', async (t) => {
  const ctx = setup(false);
  const err = await t.throwsAsync<NotEligibleTargetException>(async () => {
    isDriverOrThrow(ctx);
  });
});

test('should return true if is driver', async (t) => {
  const ctx = setup(true);
  const res = isDriverOrThrow(ctx);
  t.is(res, true);
});
