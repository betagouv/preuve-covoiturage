import test from 'ava';

import { BoundedModifier } from './BoundedModifier';
import { faker } from '../../helpers/faker';

function setup() {
  const rule = new BoundedModifier({
    minimum: 10,
    maximum: 100,
  });

  const trip = faker.trip([{ distance: 10000 }, { distance: 20000 }]);
  return { trip, rule };
}

test('should return minimum if result < min', (t) => {
  const { trip, rule } = setup();
  const context = {
    trip,
    stack: [],
    result: 1,
    person: trip.people[0],
  };
  rule.apply(context);
  t.is(context.result, 10);
});

test('should return maximum if result > max', (t) => {
  const { trip, rule } = setup();
  const context = {
    trip,
    stack: [],
    result: 1000,
    person: trip.people[0],
  };
  rule.apply(context);
  t.is(context.result, 100);
});
