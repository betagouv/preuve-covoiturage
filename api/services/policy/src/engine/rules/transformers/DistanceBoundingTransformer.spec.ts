import test from 'ava';

import { faker } from '../../helpers/faker';
import { DistanceBoundingTransformer } from './DistanceBoundingTransformer';
import { TripInterface } from '../../../interfaces';

function setup(): { rule: DistanceBoundingTransformer; trip: TripInterface } {
  const rule = new DistanceBoundingTransformer({
    min: 1000,
    max: 10000,
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
  rule.apply(context);
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
  rule.apply(context);
  t.is(context.person.distance, 10000);
});
