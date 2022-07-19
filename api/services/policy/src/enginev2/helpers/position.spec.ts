import test from 'ava';

import { StatelessContext } from '../entities/Context';
import { generateCarpool } from '../tests/helpers';
import { TerritoryCodeInterface } from '../../shared/territory/common/interfaces/TerritoryCodeInterface';
import { startsAt, endsAt } from './position';

function setup(start: TerritoryCodeInterface, end: TerritoryCodeInterface) {
  return StatelessContext.fromCarpool(1, generateCarpool({ start, end }));
}

test('should return false if starts not in list', async (t) => {
  const ctx = setup(
      { aom: '217500016', com: '91471', epci: '200056232' },
      { aom: '217500016', com: '91471', epci: '200056232' },
  );
  const res = startsAt(ctx, { com: ['91377'] });
  t.is(res, false);
});

test('should return true if starts in list', async (t) => {
  const ctx = setup(
      { aom: '217500016', com: '91471', epci: '200056232' },
      { aom: '217500016', com: '91471', epci: '200056232' },
  );
  const res = startsAt(ctx, { com: ['91471'] });
  t.is(res, true);
});

test('should return false if ends not in list', async (t) => {
  const ctx = setup(
      { aom: '217500016', com: '91471', epci: '200056232' },
      { aom: '217500016', com: '91471', epci: '200056232' },
  );
  const res = endsAt(ctx, { epci: ['999056233'] });
  t.is(res, false);
});

test('should return true if ends in list', async (t) => {
  const ctx = setup(
      { aom: '217500016', com: '91471', epci: '200056232' },
      { aom: '217500016', com: '91471', epci: '200056232' },
  );
  const res = endsAt(ctx, { epci: ['200056232'] });
  t.is(res, true);
});
