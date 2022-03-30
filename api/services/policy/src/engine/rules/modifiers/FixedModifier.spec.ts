import test from 'ava';

import { faker } from '../../helpers/faker';
import { FixedModifier } from './FixedModifier';
import { TripInterface } from '../../../interfaces';

function setup(): { rule: FixedModifier; trip: TripInterface } {
  const rule = new FixedModifier(2.5);
  const trip = faker.trip();

  return { rule, trip };
}
test('should multiply result', async (t) => {
  const { trip, rule } = setup();
  const context = {
    trip,
    stack: [],
    result: 10,
    person: trip[0],
  };
  rule.apply(context);
  t.is(context.result, 25);
});
