import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';

import { StatelessContext } from '../entities/Context.ts';
import { MisconfigurationException } from '../exceptions/MisconfigurationException.ts';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException.ts';
import { generateCarpool } from '../tests/helpers.ts';
import { isOperatorOrThrow } from './isOperatorOrThrow.ts';

function setup(operator_uuid: string) {
  return StatelessContext.fromCarpool(1, generateCarpool({ operator_uuid }));
}

it('should throw if not in list', async (t) => {
  const ctx = setup('1234');
  await assertThrows<NotEligibleTargetException>(async () => {
    isOperatorOrThrow(ctx, ['5678']);
  });
});

it('should return true if is driver', async (t) => {
  const ctx = setup('1234');
  const res = isOperatorOrThrow(ctx, ['1234']);
  assertEquals(res, true);
});

it('should throw if not an array', async (t) => {
  const ctx = setup('1234');
  t.throws(
    () => {
      isOperatorOrThrow(ctx, '' as unknown as Array<string>);
    },
    { instanceOf: MisconfigurationException },
  );
});
