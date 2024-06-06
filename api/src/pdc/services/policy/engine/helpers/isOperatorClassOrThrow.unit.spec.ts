import { anyTest as test } from '@/dev_deps.ts';

import { StatelessContext } from '../entities/Context.ts';
import { MisconfigurationException } from '../exceptions/MisconfigurationException.ts';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException.ts';
import { generateCarpool } from '../tests/helpers.ts';
import { isOperatorClassOrThrow } from './isOperatorClassOrThrow.ts';

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
