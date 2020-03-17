import test from 'ava';

import { FixedAmountSetter } from './FixedAmountSetter';
import { faker } from '../../helpers/faker';

function setup() {
  const amount = 1000;
  const rule = new FixedAmountSetter(amount);
  const trip = faker.trip([{}]);

  return { amount, rule, trip };
}

test('should replace result by fixed amount', async (t) => {
  const { amount, rule, trip } = setup();
  const context = {
    trip,
    stack: [],
    result: 0,
    person: trip.people[0],
  };
  await rule.apply(context);
  t.is(context.result, amount);
});
