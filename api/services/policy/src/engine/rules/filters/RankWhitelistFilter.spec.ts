import test from 'ava';

import { RankWhitelistFilter } from './RankWhitelistFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { faker } from '../../helpers/faker';
import { TripInterface } from '../../../interfaces';

function setup(): { rule: RankWhitelistFilter; trip: TripInterface } {
  const rule = new RankWhitelistFilter(['A']);
  const trip = faker.trip([{ operator_class: 'A' }, { operator_class: 'B' }]);

  return { rule, trip };
}

test('should throw error if rank out of whitelist', async (t) => {
  const { rule, trip } = setup();
  const err = await t.throwsAsync<NotApplicableTargetException>(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip.people[1],
    }),
  );
  t.is(err.message, RankWhitelistFilter.description);
});

test('should do nothing if rank in whitelist', async (t) => {
  const { rule, trip } = setup();
  await t.notThrowsAsync(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip.people[0],
    }),
  );
});
