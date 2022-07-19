import test from 'ava';
import { faker } from '../helpers/faker';
import { MetadataWrapper } from '../../providers/MetadataWrapper';
import { StatefulRuleSet } from './StatefulRuleSet';
import { getMetaKey } from '../helpers/getMetaKey';
import { IncentiveStateEnum, IncentiveStatusEnum } from '../../interfaces';
import { MaxAmountRestriction } from '../rules/stateful/MaxAmountRestriction';
import { MaxTripRestriction } from '../rules/stateful/MaxTripRestriction';
import { FixedAmountSetter } from '../rules/setters/FixedAmountSetter';

function setup(): { statefulSet: StatefulRuleSet } {
  const statefulSet = new StatefulRuleSet([
    {
      ctor: MaxAmountRestriction,
      params: {
        uuid: 'max_amount_restriction_uuid',
        amount: 100,
        period: 'month',
      },
    },
    {
      ctor: MaxTripRestriction,
      params: {
        uuid: 'max_trip_restriction_uuid',
        amount: 2,
        period: 'day',
        target: 'driver',
      },
    },
    {
      ctor: FixedAmountSetter,
      params: {
        amount: 10,
      },
    },
  ]);

  return { statefulSet };
}

test('should properly build initial state', async (t) => {
  const { statefulSet } = setup();
  const trip = faker.trip([
    {
      is_driver: true,
      identity_uuid: 'driver',
    },
  ]);
  const meta = new MetadataWrapper();
  statefulSet.buildInitialState(
    {
      trip,
      person: trip[0],
      stack: [],
    },
    meta,
  );

  const amountRestrictionKey = getMetaKey('max_amount_restriction', 'month', trip.datetime, 'global');
  const tripRestrictionKey = getMetaKey('max_trip_restriction', 'day', trip.datetime, trip[0].identity_uuid);

  // incentive state
  const exportMeta = meta.export();
  t.deepEqual(Object.keys(exportMeta), ['max_amount_restriction_uuid', 'max_trip_restriction_uuid']);

  t.is(exportMeta['max_amount_restriction_uuid'], amountRestrictionKey);
  t.is(exportMeta['max_trip_restriction_uuid'], tripRestrictionKey);

  // policy state
  // t.true(policy instanceof Map);
  // t.deepEqual([...policy.keys()], [amountRestrictionKey, tripRestrictionKey]);
  // t.is(policy.get(amountRestrictionKey), 0);
  // t.is(policy.get(tripRestrictionKey), 0);
});

test('should list state keys', async (t) => {
  const { statefulSet } = setup();
  const trip = faker.trip([
    {
      is_driver: true,
      identity_uuid: 'driver',
    },
  ]);

  const amountRestrictionKey = getMetaKey('max_amount_restriction', 'month', trip.datetime, 'global');
  const tripRestrictionKey = getMetaKey('max_trip_restriction', 'day', trip.datetime, trip[0].identity_uuid);

  const keys = statefulSet.listStateKeys({
    carpool_id: 1,
    policy_id: 1,
    datetime: new Date(),
    result: 0,
    amount: 0,
    state: IncentiveStateEnum.Regular,
    status: IncentiveStatusEnum.Draft,
    meta: {
      toto: 'this should not be visible',
      max_amount_restriction_uuid: amountRestrictionKey,
      max_trip_restriction_uuid: tripRestrictionKey,
    },
  });
  t.deepEqual(keys, [amountRestrictionKey, tripRestrictionKey]);
});

test('should apply stateful rules and update meta', async (t) => {
  const { statefulSet } = setup();
  const trip = faker.trip([
    {
      is_driver: true,
      identity_uuid: 'driver',
    },
  ]);

  const amountRestrictionKey = getMetaKey('max_amount_restriction', 'month', trip.datetime, 'global');
  const tripRestrictionKey = getMetaKey('max_trip_restriction', 'day', trip.datetime, trip[0].identity_uuid);

  const meta = new MetadataWrapper(0, [
    [amountRestrictionKey, 50],
    [tripRestrictionKey, 1],
  ]);

  const r = statefulSet.apply(
    {
      carpool_id: 1,
      policy_id: 1,
      datetime: trip.datetime,
      result: 100,
      amount: 0,
      state: IncentiveStateEnum.Regular,
      status: IncentiveStatusEnum.Draft,
      meta: {
        toto: 'this should not be visible',
        max_amount_restriction_uuid: amountRestrictionKey,
        max_trip_restriction_uuid: tripRestrictionKey,
      },
    },
    meta,
  );

  t.is(r, 50);
  t.true(meta.has(amountRestrictionKey));
  t.is(meta.get(amountRestrictionKey), 100);

  t.true(meta.has(tripRestrictionKey));
  t.is(meta.get(tripRestrictionKey), 2);
});

test('should do nothing if key is missing in incentive meta', async (t) => {
  const { statefulSet } = setup();
  const trip = faker.trip([
    {
      is_driver: true,
      identity_uuid: 'driver',
    },
  ]);

  const amountRestrictionKey = getMetaKey('max_amount_restriction', 'month', trip.datetime, 'global');
  const tripRestrictionKey = getMetaKey('max_trip_restriction', 'day', trip.datetime, trip[0].identity_uuid);

  const meta = new MetadataWrapper(0, [
    [amountRestrictionKey, 50],
    [tripRestrictionKey, 1],
  ]);

  const result = statefulSet.apply(
    {
      carpool_id: 1,
      policy_id: 1,
      datetime: trip.datetime,
      result: 100,
      amount: 0,
      state: IncentiveStateEnum.Regular,
      status: IncentiveStatusEnum.Draft,
      meta: {
        toto: 'this should not be visible',
        // max_amount_restriction_uuid: amountRestrictionKey,
        max_trip_restriction_uuid: tripRestrictionKey,
      },
    },
    meta,
  );
  t.is(result, 100);
});

test('should use default value if key is missing in policy meta', async (t) => {
  const { statefulSet } = setup();
  const trip = faker.trip([
    {
      is_driver: true,
      identity_uuid: 'driver',
    },
  ]);

  const amountRestrictionKey = getMetaKey('max_amount_restriction', 'month', trip.datetime, 'global');
  const tripRestrictionKey = getMetaKey('max_trip_restriction', 'day', trip.datetime, trip[0].identity_uuid);

  const meta = new MetadataWrapper(0, [
    // [amountRestrictionKey, 50],
    [tripRestrictionKey, 2],
  ]);

  statefulSet.apply(
    {
      carpool_id: 1,
      policy_id: 1,
      datetime: trip.datetime,
      result: 100,
      amount: 0,
      state: IncentiveStateEnum.Regular,
      status: IncentiveStatusEnum.Draft,
      meta: {
        toto: 'this should not be visible',
        max_amount_restriction_uuid: amountRestrictionKey,
        max_trip_restriction_uuid: tripRestrictionKey,
      },
    },
    meta,
  );

  t.true(meta.has(amountRestrictionKey));
  t.is(meta.get(amountRestrictionKey), 100);
});
