import test from 'ava';

import { StatelessContext } from '../entities/Context.ts';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException.ts';
import { generateCarpool } from '../tests/helpers.ts';
import { isAdultOrThrow } from './isAdultOrThrow.ts';

function setup(passenger_is_over_18: boolean) {
  return StatelessContext.fromCarpool(1, generateCarpool({ passenger_is_over_18 }));
}

test('should throw if not an adult', async (t) => {
  const ctx = setup(false);
  await t.throwsAsync<NotEligibleTargetException>(async () => {
    isAdultOrThrow(ctx);
  });
});

test('should return true if adult', async (t) => {
  const ctx = setup(true);
  const res = isAdultOrThrow(ctx);
  t.is(res, true);
});
