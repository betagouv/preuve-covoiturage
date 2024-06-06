import { anyTest as test } from '@/dev_deps.ts';

import { StatelessContext } from '../entities/Context.ts';
import { generateCarpool } from '../tests/helpers.ts';
import { isAfter } from './isAfter.ts';

function setup(datetime: Date) {
  return StatelessContext.fromCarpool(1, generateCarpool({ datetime }));
}

test('should return false if not in range', async (t) => {
  const ctx = setup(new Date('2022-01-03'));
  const res = isAfter(ctx, { date: new Date('2022-01-04') });
  t.is(res, false);
});

test('should return true if in range', async (t) => {
  const ctx = setup(new Date('2022-01-03'));
  const res = isAfter(ctx, { date: new Date('2022-01-02') });
  t.is(res, true);
});
