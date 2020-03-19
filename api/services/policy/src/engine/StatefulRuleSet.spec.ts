import test from 'ava';
import { CampaignInterface } from '../interfaces';
import { MetadataProviderInterfaceResolver, MetaInterface } from './interfaces';
import { PolicyEngine } from './PolicyEngine';
import { faker } from './helpers/faker';
import { MetadataWrapper } from './meta/MetadataWrapper';
import { StatefulRuleSet } from './StatefulRuleSet';
import { getMetaKey } from './helpers/getMetaKey';
import { IncentiveStateEnum, IncentiveStatusEnum } from '../interfaces/IncentiveInterface';

function setup() {
  const statefulSet = new StatefulRuleSet([
    {
      slug: 'max_amount_restriction',
      parameters: {
        uuid: 'max_amount_restriction_uuid',
        amount: 100,
        period: 'month',
      },
    },
    {
      slug: 'max_trip_restriction',
      parameters: {
        uuid: 'max_trip_restriction_uuid',
        amount: 2,
        period: 'day',
        target: 'driver',
      },
    },
    {
      slug: 'fixed_amount_setter',
      parameters: {
        amount: 10,
      },
    },
  ]);

  return { statefulSet };
}

test('should properly build initial state', async (t) => {
  const { statefulSet } = setup();
  const trip = faker.trip([{
    is_driver: true,
    identity_uuid: 'driver',
  }]);

  const { incentive, policy } = statefulSet.buildInitialState({
    trip,
    person: trip.people[0],
    stack: [],
  });
  t.log(incentive, policy);

  const amountRestrictionKey = getMetaKey('max_amount_restriction', trip.datetime, 'month', 'global');
  const tripRestrictionKey = getMetaKey('max_trip_restriction', trip.datetime, 'day', trip.people[0].identity_uuid);

  // incentive state 
  t.true(incentive instanceof Map);
  t.deepEqual([...incentive.keys()], ['max_amount_restriction_uuid', 'max_trip_restriction_uuid']);

  t.is(incentive.get('max_amount_restriction_uuid'), amountRestrictionKey);
  t.is(incentive.get('max_trip_restriction_uuid'), tripRestrictionKey);

  // policy state
  t.true(policy instanceof Map);
  t.deepEqual([...policy.keys()], [amountRestrictionKey, tripRestrictionKey]);
  t.is(policy.get(amountRestrictionKey), 0);
  t.is(policy.get(tripRestrictionKey), 0);
});

test('should list state keys', async (t) => {
  const { statefulSet } = setup();
  const trip = faker.trip([{
    is_driver: true,
    identity_uuid: 'driver',
  }]);

  const amountRestrictionKey = getMetaKey('max_amount_restriction', trip.datetime, 'month', 'global');
  const tripRestrictionKey = getMetaKey('max_trip_restriction', trip.datetime, 'day', trip.people[0].identity_uuid);

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
  t.deepEqual(keys, [amountRestrictionKey, tripRestrictionKey])
});

test('should apply stateful rules and update meta', async (t) => {
  const { statefulSet } = setup();
  const trip = faker.trip([{
    is_driver: true,
    identity_uuid: 'driver',
  }]);

  const amountRestrictionKey = getMetaKey('max_amount_restriction', trip.datetime, 'month', 'global');
  const tripRestrictionKey = getMetaKey('max_trip_restriction', trip.datetime, 'day', trip.people[0].identity_uuid);

  const meta = new MetadataWrapper(0, [
    [amountRestrictionKey, 50],
    [tripRestrictionKey, 2],
  ]);

  const r = statefulSet.apply({
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
  }, meta);
  t.is(r, 0);
});

test('should do nothing if key is missing in incentive meta', async (t) => {
  const { statefulSet } = setup();
  const trip = faker.trip([{
    is_driver: true,
    identity_uuid: 'driver',
  }]);

  const amountRestrictionKey = getMetaKey('max_amount_restriction', trip.datetime, 'month', 'global');
  const tripRestrictionKey = getMetaKey('max_trip_restriction', trip.datetime, 'day', trip.people[0].identity_uuid);

  const meta = new MetadataWrapper(0, [
    [amountRestrictionKey, 50],
    [tripRestrictionKey, 1],
  ]);

  const result = statefulSet.apply({
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
      // max_trip_restriction_uuid: tripRestrictionKey,
    },
  }, meta)
  t.is(result, 100);
});

test('should throw if key is missing in policy meta', async (t) => {
  const { statefulSet } = setup();
  const trip = faker.trip([{
    is_driver: true,
    identity_uuid: 'driver',
  }]);

  const amountRestrictionKey = getMetaKey('max_amount_restriction', trip.datetime, 'month', 'global');
  const tripRestrictionKey = getMetaKey('max_trip_restriction', trip.datetime, 'day', trip.people[0].identity_uuid);

  const meta = new MetadataWrapper(0, [
    // [amountRestrictionKey, 50],
    [tripRestrictionKey, 2],
  ]);

  const err = t.throws(() => statefulSet.apply({
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
  }, meta));
  t.is(err.message, 'Unable to build state, missing key');
});