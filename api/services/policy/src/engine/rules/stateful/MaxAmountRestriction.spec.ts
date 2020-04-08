import test from 'ava';

import { MaxAmountRestriction } from './MaxAmountRestriction';
import { faker } from '../../helpers/faker';
import { StatefulRestrictionParameters } from './AbstractStatefulRestriction';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { MetadataWrapper, FakeMetadataWrapper } from '../../meta/MetadataWrapper';
import { TripInterface } from '../../../interfaces';

function setup(cfg: Partial<StatefulRestrictionParameters> = {}): { rule: MaxAmountRestriction; trip: TripInterface } {
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

test('should not call meta if wrong target', async (t) => {
  class MetaWrapper extends MetadataWrapper {
    get(k: string, fb: number): number {
      throw new Error('This should not be called');
    }
  }
  const meta = new MetaWrapper(0);
  const { rule, trip } = setup({ target: 'driver' });
  const context = {
    trip: trip,
    stack: [],
    person: trip.people.find((p) => !p.is_driver),
  };

  await t.notThrowsAsync(async () => rule.getState(context, meta));
});

test('should properly build build meta key and set initial state', async (t) => {
  const meta = new FakeMetadataWrapper();
  const { rule, trip } = setup({ target: 'driver' });
  const driver = trip.people.find((p) => p.is_driver);
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
  const { rule } = setup();
  await t.throwsAsync<NotApplicableTargetException>(async () => rule.apply(20, 20));
});

test('should do nothing if limit is not reached', async (t) => {
  const { rule } = setup();
  await t.notThrowsAsync(async () => rule.apply(5, 0));
});

test('should properly update state', async (t) => {
  const { rule } = setup();
  const result = rule.setState(5, 0);
  t.is(result, 5);
});
