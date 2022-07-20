import test from 'ava';

import { StatelessContext } from '../entities/Context';
import { MisconfigurationException } from '../exceptions/MisconfigurationException';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import { generateCarpool } from '../tests/helpers';
import { isOperatorOrThrow } from './isOperatorOrThrow';

function setup(operator_siret: string) {
  return StatelessContext.fromCarpool(1, generateCarpool({ operator_siret }));
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
