import test from 'ava';

import { DistanceRangeFilter } from './DistanceRangeFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { faker } from '../../helpers/faker';
import { TripInterface } from '../../../interfaces';

function setup(): { trip: TripInterface; rule: DistanceRangeFilter } {
  const rule = new DistanceRangeFilter({
    min: 10,
    max: 100,
  });

  const trip = faker.trip([{ distance: 50 }, { distance: 5000 }]);
  return { trip, rule };
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
  t.is(err.message, DistanceRangeFilter.description);
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
