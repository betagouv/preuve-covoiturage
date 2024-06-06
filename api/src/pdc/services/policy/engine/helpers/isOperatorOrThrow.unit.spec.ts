import { anyTest as test } from '@/dev_deps.ts';

import { StatelessContext } from '../entities/Context.ts';
import { MisconfigurationException } from '../exceptions/MisconfigurationException.ts';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException.ts';
import { generateCarpool } from '../tests/helpers.ts';
import { isOperatorOrThrow } from './isOperatorOrThrow.ts';

function setup(operator_uuid: string) {
  return StatelessContext.fromCarpool(1, generateCarpool({ operator_uuid }));
}

test('should throw if not in list', async (t) => {
  const ctx = setup('1234');
  await t.throwsAsync<NotEligibleTargetException>(async () => {
    isOperatorOrThrow(ctx, ['5678']);
  });
});

test('should return true if is driver', async (t) => {
  const ctx = setup('1234');
  const res = isOperatorOrThrow(ctx, ['1234']);
  t.is(res, true);
});

test('should throw if not an array', async (t) => {
  const ctx = setup('1234');
  t.throws(
    () => {
      isOperatorOrThrow(ctx, '' as unknown as Array<string>);
    },
    { instanceOf: MisconfigurationException },
  );
});
