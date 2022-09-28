import test from 'ava';

import { StatelessContext } from '../entities/Context';
import { MisconfigurationException } from '../exceptions/MisconfigurationException';
import { generateCarpool } from '../tests/helpers';
import { atDate } from './atDate';

function setup(datetime: Date) {
  return StatelessContext.fromCarpool(1, generateCarpool({ datetime }));
}

test('should return false if not in list', async (t) => {
  const ctx = setup(new Date('2022-01-01'));
  const res = atDate(ctx, { dates: [] });
  t.is(res, false);
});

test('should return true if in list', async (t) => {
  const ctx = setup(new Date('2022-01-01'));
  const res = atDate(ctx, { dates: ['2022-01-01'] });
  t.is(res, true);
});

test('should throw if not an array', async (t) => {
  const ctx = setup(new Date('2022-01-01'));
  t.throws(
    () => {
      atDate(ctx, { dates: '' as unknown as Array<string> });
    },
    { instanceOf: MisconfigurationException },
  );
});
