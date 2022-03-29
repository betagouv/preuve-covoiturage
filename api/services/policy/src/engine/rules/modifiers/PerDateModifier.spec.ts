import test from 'ava';

import { faker } from '../../helpers/faker';
import { PerDateModifier } from './PerDateModifier';
import { TripInterface } from '../../../interfaces';
import { RuleHandlerParamsInterface } from '../../interfaces';

function setup(): { rule: PerDateModifier; trip: TripInterface } {
  const rule = new PerDateModifier({
    dates: ['2021-01-02'],
    coef: 2.5,
  });
  const trip = faker.trip([
    { datetime: new Date('2021-01-02T13:00:00.000Z') },
    { datetime: new Date('2021-02-02T13:00:00.000Z') },
  ]);

  return { rule, trip };
}
test('should multiply result if in date', async (t) => {
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

test('should not multiply result if not in date', async (t) => {
  const { trip, rule } = setup();
  const context = {
    trip,
    stack: [],
    result: 10,
    person: trip[1],
  };
  rule.apply(context);
  t.is(context.result, 10);
});

test('should work with string', async (t) => {
  const { trip, rule } = setup();
  const context = {
    trip,
    stack: [],
    result: 10,
    person: { ...trip[0], datetime: '2021-01-02T14:00:00.000Z' },
  };
  rule.apply(context as unknown as RuleHandlerParamsInterface);
  t.is(context.result, 25);
});
