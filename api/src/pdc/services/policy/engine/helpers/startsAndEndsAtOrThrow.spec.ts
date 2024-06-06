import { anyTest as test } from '@/dev_deps.ts';
import { TerritoryCodeInterface } from '../../interfaces/index.ts';
import { StatelessContext } from '../entities/Context.ts';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException.ts';
import { generateCarpool } from '../tests/helpers.ts';
import { startsAndEndsAtOrThrow } from './startsAndEndsAtOrThrow.ts';

function setup(start: TerritoryCodeInterface, end: TerritoryCodeInterface) {
  return StatelessContext.fromCarpool(1, generateCarpool({ start, end }));
}

test('should throw if start and end not in perimeter', async (t) => {
  const ctx = setup(
    { aom: '217500016', com: '91471', reg: '11', epci: '200056232' },
    { aom: '217500016', com: '91471', reg: '11', epci: '200056232' },
  );
  t.throws(
    () => {
      startsAndEndsAtOrThrow(ctx, { reg: ['84'] });
    },
    { instanceOf: NotEligibleTargetException },
  );
});

test('should pass if start and end is in perimeter', async (t) => {
  const ctx = setup(
    { aom: '217500016', com: '91471', reg: '11', epci: '200056232' },
    { aom: '217500016', com: '91471', reg: '11', epci: '200056232' },
  );
  const res = startsAndEndsAtOrThrow(ctx, { aom: ['217500016'] });
  t.is(res, true);
});
