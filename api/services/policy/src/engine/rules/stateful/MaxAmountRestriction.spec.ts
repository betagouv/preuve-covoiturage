import test from 'ava';

import { MaxAmountRestriction } from './MaxAmountRestriction';
import { faker } from '../../helpers/faker';
import { StatefulRestrictionParameters } from './AbstractStatefulRestriction';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { MetadataWrapper, FakeMetadataWrapper } from '../../meta/MetadataWrapper';

function setup(cfg: Partial<StatefulRestrictionParameters> = {}) {
  const basecfg: StatefulRestrictionParameters = {
    uuid: 'test',
    amount: 10,
    period: 'day',
  };

  const rule = new MaxAmountRestriction({
    ...basecfg,
    ...cfg,
  });

  const trip = faker.trip([
    {
      carpool_id: 1,
      identity_uuid: 'driver',
      is_driver: true,
    },
    {
      carpool_id: 2,
      identity_uuid: 'passenger',
      is_driver: false,
    },
  ]);

  return { rule, trip };
}

test('should throw an exception if wrong target', async (t) => {
  const meta = new MetadataWrapper(0);
  const { rule, trip } = setup({ target: 'driver' });
  const context = {
    trip: trip,
    stack: [],
    person: trip.people.find(p => !p.is_driver),
  };

  await t.throwsAsync<NotApplicableTargetException>(async () => rule.getState(context, meta));
});

test('should properly build build meta key and set initial state', async (t) => {
  const meta = new FakeMetadataWrapper();
  const { rule, trip } = setup({ target: 'driver' });
  const driver = trip.people.find(p => p.is_driver);
  const context = {
    trip: trip,
    stack: [],
    person: driver,
  };

  await rule.getState(context, meta);
  const keys = meta.keys();
  t.true(Array.isArray(keys));
  t.is(keys.length, 1);
  const [day, month, year] = [trip.datetime.getDate(), trip.datetime.getMonth(), trip.datetime.getFullYear()];

  t.is(keys[0], `${MaxAmountRestriction.slug}.${driver.identity_uuid}.day.${day}-${month}-${year}`);
  const values = meta.values();
  t.is(values[0], 0);
});

test('should throw an exception if limit is reached', async (t) => {
  const { rule, trip } = setup();
  const context = {
    trip: trip,
    stack: [],
    result: 20,
    amount: 20,
    person: trip.people[0],
  };

  await t.throwsAsync<NotApplicableTargetException>(async () => rule.apply(context, 20));
});

test('should do nothing if limit is not reached', async (t) => {
  const { rule, trip } = setup();
  const context = {
    trip: trip,
    stack: [],
    result: 5,
    amount: 5,
    person: trip.people[0],
  };

  await t.notThrowsAsync(async () => rule.apply(context, 0));
});

test('should properly update state', async (t) => {
  const { rule, trip } = setup();
  const context = {
    trip: trip,
    stack: [],
    result: 5,
    amount: 5,
    person: trip.people[0],
  };

  const result = rule.setState(context, 0);
  t.is(result, 5);
});
