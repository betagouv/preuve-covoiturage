import test from 'ava';

import { StatelessContext } from '../entities/Context';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import { generateCarpool } from '../tests/helpers';
import { isAdultOrThrow } from './isAdultOrThrow';

function setup(is_over_18: boolean) {
  return StatelessContext.fromCarpool(1, generateCarpool({ is_over_18 }));
}

test('should throw if not an adult', async (t) => {
  const ctx = setup(false);
  const err = await t.throwsAsync<NotEligibleTargetException>(async () => {
    isAdultOrThrow(ctx);
  });
});

test('should return true if adult', async (t) => {
  const ctx = setup(true);
  const res = isAdultOrThrow(ctx);
  t.is(res, true);
});
