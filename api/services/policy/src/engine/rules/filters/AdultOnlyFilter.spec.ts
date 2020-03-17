import test from 'ava';
import { AdultOnlyFilter } from './AdultOnlyFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { faker } from '../../helpers/faker';

function setup() {
  const rule = new AdultOnlyFilter();
  const trip = faker.trip([{ is_over_18: false }, { is_over_18: true }]);

  return { rule, trip };
}

test('should throw error if person is not adult', async (t) => {
  const { rule, trip } = setup();
  const err = await t.throwsAsync<NotApplicableTargetException>(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip.people[0],
    }),
  );
  t.is(err.message, AdultOnlyFilter.description);
});

test('should do nothing if person is adult', async (t) => {
  const { rule, trip } = setup();
  await t.notThrowsAsync(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip.people[1],
    }),
  );
});
