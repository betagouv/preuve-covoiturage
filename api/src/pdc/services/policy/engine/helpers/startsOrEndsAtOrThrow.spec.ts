import test from 'ava';
import { TerritoryCodeInterface } from '../../interfaces';
import { StatelessContext } from '../entities/Context';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import { generateCarpool } from '../tests/helpers';
import { startsOrEndsAtOrThrow } from './startsOrEndsAtOrThrow';

function setup(start: TerritoryCodeInterface, end: TerritoryCodeInterface) {
  return StatelessContext.fromCarpool(1, generateCarpool({ start, end }));
}

test('should throw if not start or end in perimeter', async (t) => {
  const ctx = setup(
    { aom: '217500016', com: '91471', reg: '11', epci: '200056232' },
    { aom: '217500016', com: '91471', reg: '11', epci: '200056232' },
  );
  t.throws(
    () => {
      startsOrEndsAtOrThrow(ctx, { reg: ['84'] });
    },
    { instanceOf: NotEligibleTargetException },
  );
});

test('should pass if start OR end in perimeter', async (t) => {
  const ctx = setup(
    { aom: '200067551', com: '74206', reg: '74', epci: '200067551' },
    { aom: '217500016', com: '91471', reg: '11', epci: '200056232' },
  );
  const res = startsOrEndsAtOrThrow(ctx, { aom: ['217500016'] });
  t.is(res, true);
});
