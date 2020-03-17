import test from 'ava';
import { PerSeatModifier } from './PerSeatModifier';
import { faker } from '../../helpers/faker';

function setup() {
  const rule = new PerSeatModifier();

  const trip = faker.trip([
    { seats: 0, is_driver: true },
    { seats: 5, is_driver: false },
  ]);
  return { rule, trip };
}
test('should multiply result by number of seat', async (t) => {
  const { rule, trip } = setup();
  const context = {
    trip,
    stack: [],
    result: 10,
    person: trip.people[0],
  };
  await rule.apply(context);
  t.is(context.result, 10);

  const context2 = {
    trip,
    stack: [],
    result: 10,
    person: trip.people[1],
  };
  await rule.apply(context2);
  t.is(context2.result, 50);
});
