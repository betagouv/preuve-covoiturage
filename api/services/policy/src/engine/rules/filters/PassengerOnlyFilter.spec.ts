import test from 'ava';

import { PassengerOnlyFilter } from './PassengerOnlyFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { faker } from '../../helpers/faker';
import { TripInterface } from '../../../interfaces';

function setup(): { rule: PassengerOnlyFilter; trip: TripInterface } {
  const rule = new PassengerOnlyFilter();
  const trip = faker.trip([{ is_driver: true }, { is_driver: false }]);

  return { rule, trip };
}

test('should throw error if person is not passenger', async (t) => {
  const { rule, trip } = setup();
  const err = await t.throwsAsync<NotApplicableTargetException>(async () =>
    rule.filter({
      person: trip[0],
      trip,
      stack: [],
    }),
  );
  t.is(err.message, PassengerOnlyFilter.description);
});

test('should do nothing if person is passenger', async (t) => {
  const { rule, trip } = setup();
  await t.notThrowsAsync(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip[1],
    }),
  );
});
