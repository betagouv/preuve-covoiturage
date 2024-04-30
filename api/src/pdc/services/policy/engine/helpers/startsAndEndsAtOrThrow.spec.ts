import test from 'ava';
import { TerritoryCodeInterface } from '../../interfaces';
import { StatelessContext } from '../entities/Context';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import { generateCarpool } from '../tests/helpers';
import { startsAndEndsAtOrThrow } from './startsAndEndsAtOrThrow';

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
