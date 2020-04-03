import test from 'ava';

import { faker } from '../../helpers/faker';
import { PerKmModifier } from './PerKmModifier';
import { TripInterface } from '../../../interfaces';

function setup(): { rule: PerKmModifier; trip: TripInterface } {
  const rule = new PerKmModifier();
  const trip = faker.trip([{ distance: 10000 }, { distance: 20000 }]);

  return { rule, trip };
}
test('should multiply result by distance in km', async (t) => {
  const { trip, rule } = setup();
  const context = {
    trip,
    stack: [],
    result: 1,
    person: trip.people[0],
  };
  await rule.apply(context);
  t.is(context.result, trip.people[0].distance / 1000);
});
