import test from 'ava';
import { OperatorWhitelistFilter } from './OperatorWhitelistFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { faker } from '../../helpers/faker';

function setup() {
  const rule = new OperatorWhitelistFilter([1]);
  const trip = faker.trip([{ operator_id: 1 }, { operator_id: 2 }]);
  return { rule, trip };
}

test('should throw error if operator out of whitelist', async (t) => {
  const { rule, trip } = setup();
  const err = await t.throwsAsync<NotApplicableTargetException>(async () =>
    rule.filter({
      person: trip.people[1],
      trip,
      stack: [],
    }),
  );
  t.is(err.message, OperatorWhitelistFilter.description);
});

test('should do nothing if operator in whitelist', async (t) => {
  const { rule, trip } = setup();
  await t.notThrowsAsync(async () =>
    rule.filter({
      person: trip.people[0],
      trip,
      stack: [],
    }),
  );
});
