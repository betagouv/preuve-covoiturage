import test from 'ava';

import { DistanceBoundingTransformer } from './DistanceBoundingTransformer';
import { faker } from '../../helpers/faker';

function setup() {
  const rule = new DistanceBoundingTransformer({
    minimum: 1000,
    maximum: 10000,
  });

  const trip = faker.trip([{ distance: 100 }, { distance: 20000 }]);
  return { rule, trip };
}

test('should update distance to minimum if result < min', async (t) => {
  const { rule, trip } = setup();
  const context = {
    trip,
    stack: [],
    result: 1,
    person: trip.people[0],
  };
  await rule.apply(context);
  t.is(context.person.distance, 1000);
});

test('should updte distance to maximum if result > max', async (t) => {
  const { rule, trip } = setup();
  const context = {
    trip,
    stack: [],
    result: 1,
    person: trip.people[1],
  };
  await rule.apply(context);
  t.is(context.person.distance, 10000);
});
