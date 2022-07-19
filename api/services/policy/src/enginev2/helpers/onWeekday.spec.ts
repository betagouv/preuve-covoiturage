import test from 'ava';

import { StatelessContext } from '../entities/Context';
import { generateCarpool } from '../tests/helpers';
import { onWeekday } from './onWeekday';

function setup(datetime: Date) {
  return StatelessContext.fromCarpool(1, generateCarpool({ datetime }));
}

test('should return false if not in list', async (t) => {
  const ctx = setup(new Date('2022-01-01'));
  const res = onWeekday(ctx, { days: []});
  t.is(res, false);
});

test('should return true if in list', async (t) => {
  const date = new Date('2022-01-01');
  const ctx = setup(date);
  const res = onWeekday(ctx, { days: [date.getDay()]});
  t.is(res, true);
});
