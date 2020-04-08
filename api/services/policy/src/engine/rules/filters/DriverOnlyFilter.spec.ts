import test from 'ava';

import { DriverOnlyFilter } from './DriverOnlyFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { faker } from '../../helpers/faker';
import { TripInterface } from '../../../interfaces';

function setup(): { rule: DriverOnlyFilter; trip: TripInterface } {
  const rule = new DriverOnlyFilter();
  const trip = faker.trip([{ is_driver: true }, { is_driver: false }]);
  return { rule, trip };
}

test('should throw error if person is not driver', async (t) => {
  const { trip, rule } = setup();
  const err = await t.throwsAsync<NotApplicableTargetException>(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip.people[1],
    }),
  );
  t.is(err.message, DriverOnlyFilter.description);
});

test('should do nothing if person is driver', async (t) => {
  const { trip, rule } = setup();
  await t.notThrowsAsync(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip.people[0],
    }),
  );
});
