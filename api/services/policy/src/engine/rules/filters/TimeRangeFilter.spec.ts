import test from 'ava';

import { faker } from '../../helpers/faker';
import { TimeRangeFilter } from './TimeRangeFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { TripInterface } from '../../../interfaces';

function setup(): { rule: TimeRangeFilter; trip: TripInterface } {
  const rule = new TimeRangeFilter([
    {
      start: 8,
      end: 10,
    },
    {
      start: 17,
      end: 20,
    },
  ]);

  const startInRange = new Date();
  startInRange.setHours(9);

  const startOutRange = new Date();
  startOutRange.setHours(12);

  const trip = faker.trip([{ datetime: startInRange }, { datetime: startOutRange }]);

  return { rule, trip };
}

test('should throw error if out of range', async (t) => {
  const { rule, trip } = setup();
  const err = await t.throwsAsync<NotApplicableTargetException>(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip.people[1],
    }),
  );
  t.is(err.message, TimeRangeFilter.description);
});

test('should do nothing if in range', async (t) => {
  const { rule, trip } = setup();
  await t.notThrowsAsync(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip.people[0],
    }),
  );
});
