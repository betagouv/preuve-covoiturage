import test from 'ava';

import { MaxAmountRestriction } from './MaxAmountRestriction';
import { faker } from '../../helpers/faker';
import { StatefulRestrictionParameters } from './AbstractStatefulRestriction';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { MetadataWrapper } from '../../../providers/MetadataWrapper';
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

test('should not export anything if wrong target', async (t) => {
  const meta = new MetadataWrapper();
  const { rule, trip } = setup({ target: 'driver' });
  const context = {
    trip: trip,
    stack: [],
    person: trip.find((p) => !p.is_driver),
  };

  rule.initState(context, meta);
  const state = meta.export();
  t.deepEqual(Object.keys(state), []);
});

test('should properly build build meta key and set initial state', async (t) => {
  const meta = new MetadataWrapper();
  const { rule, trip } = setup({ target: 'driver' });
  const driver = trip.find((p) => p.is_driver);
  const context = {
    trip: trip,
    stack: [],
    person: driver,
  };

  rule.initState(context, meta);
  const key = meta.export()[rule.uuid];
  const [day, month, year] = [trip.datetime.getDate(), trip.datetime.getMonth(), trip.datetime.getFullYear()];
  t.is(key, `${MaxAmountRestriction.slug}.${driver.identity_uuid}.day.${day}-${month}-${year}`);
  const value = meta.get(key);
  t.is(value, 0);
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
  const result = rule.getNewState(5, 0);
  t.is(result, 5);
});
