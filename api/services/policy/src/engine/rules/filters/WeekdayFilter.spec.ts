import test from 'ava';

import { WeekdayFilter } from './WeekdayFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { faker } from '../../helpers/faker';
import { TripInterface } from '../../../interfaces';

function setup(): { trip: TripInterface; rule: WeekdayFilter } {
  const startInRange = new Date();
  const rule = new WeekdayFilter([startInRange.getDay()]);

  const startOutRange = new Date();
  startOutRange.setDate(startOutRange.getDate() + 1);

  const trip = faker.trip([{ datetime: startInRange }, { datetime: startOutRange }]);

  return { trip, rule };
}

test('should throw error if out of range', async (t) => {
  const { rule, trip } = setup();
  const err = await t.throwsAsync<NotApplicableTargetException>(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip[1],
    }),
  );
  t.is(err.message, WeekdayFilter.description);
});

test('should do nothing if in range', async (t) => {
  const { rule, trip } = setup();
  await t.notThrowsAsync(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip[0],
    }),
  );
});
