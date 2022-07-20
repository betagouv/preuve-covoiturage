import test from 'ava';

import { StatelessContext } from '../entities/Context';
import { MisconfigurationException } from '../exceptions/MisconfigurationException';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import { generateCarpool } from '../tests/helpers';
import { isOperatorClassOrThrow } from './isOperatorClassOrThrow';

function setup(operator_class: string) {
  return StatelessContext.fromCarpool(1, generateCarpool({ operator_class }));
}

test('should throw if not in list', async (t) => {
  const ctx = setup('A');
  await t.throwsAsync<NotEligibleTargetException>(async () => {
    isOperatorClassOrThrow(ctx, ['B']);
  });
});

test('should return true if is driver', async (t) => {
  const ctx = setup('B');
  const res = isOperatorClassOrThrow(ctx, ['B']);
  t.is(res, true);
});

test('should throw if not an array', async (t) => {
  const ctx = setup('B');
  t.throws(
    () => {
      isOperatorClassOrThrow(ctx, '' as unknown as Array<string>);
    },
    { instanceOf: MisconfigurationException },
  );
});
