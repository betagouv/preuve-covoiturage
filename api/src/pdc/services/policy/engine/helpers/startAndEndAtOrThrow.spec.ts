import test from 'ava';

import { StatelessContext } from '../entities/Context';
import { generateCarpool } from '../tests/helpers';
import { TerritoryCodeInterface } from '../../interfaces';
import { startAndEndAtOrThrow } from './startAndEndAtOrThrow';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';

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
      startAndEndAtOrThrow(ctx, { reg: ['84'] });
    },
    { instanceOf: NotEligibleTargetException },
  );
});

test('should pass if start and end is in perimeter', async (t) => {
  const ctx = setup(
    { aom: '217500016', com: '91471', reg: '11', epci: '200056232' },
    { aom: '217500016', com: '91471', reg: '11', epci: '200056232' },
  );
  const res = startAndEndAtOrThrow(ctx, { aom: ['217500016'] });
  t.is(res, true);
});
