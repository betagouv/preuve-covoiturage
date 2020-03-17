import test from 'ava';
import { PerPassengerModifier } from './PerPassengerModifier';
import { faker } from '../../helpers/faker';

function setup() {
  const rule = new PerPassengerModifier();

  const trip = faker.trip([
    { seats: 10, is_driver: true },
    { seats: 5, is_driver: false },
  ]);

  return { rule, trip };
}

test('should multiply result by number of passenger', async (t) => {
  const { rule, trip } = setup();
  const context = {
    trip,
    stack: [],
    result: 1,
    person: trip.people[0],
  };
  await rule.apply(context);
  t.is(context.result, trip.people[1].seats);
});
