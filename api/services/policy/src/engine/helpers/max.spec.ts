import test from 'ava';

import { StatefulContext, StatelessContext } from '../entities/Context';
import { MetadataStore } from '../entities/MetadataStore';
import {
  CarpoolInterface,
  IncentiveStateEnum,
  IncentiveStatusEnum,
  MetadataLifetime,
  MetadataStoreInterface,
  SerializedIncentiveInterface,
  StatelessContextInterface,
} from '../../interfaces';
import { generateCarpool, generateIncentive } from '../tests/helpers';
import {
  applyForMaximum,
  MaximumTargetEnum,
  setMax,
  watchForGlobalMaxAmount,
  watchForPassengerMaxByTripByDay,
  watchForPersonMaxAmountByMonth,
  watchForPersonMaxTripByDay,
  watchForPersonMaxTripByMonth,
} from './max';

function setupStateless(): [StatelessContextInterface, CarpoolInterface] {
  const carpool = generateCarpool();
  return [StatelessContext.fromCarpool(1, carpool), carpool];
}

async function setupStateful(
  data: Partial<SerializedIncentiveInterface> = {},
): Promise<[StatefulContext, MetadataStoreInterface]> {
  const store = new MetadataStore();
  return [await StatefulContext.fromIncentive(store, generateIncentive(data)), store];
}

test('should watchForGlobalMaxAmount', async (t) => {
  const [ctx] = setupStateless();
  watchForGlobalMaxAmount(ctx, '1');
  t.deepEqual(ctx.meta.export(), [
    {
      uuid: '1',
      key: 'max_amount_restriction.global.campaign.global',
      initialValue: undefined,
      lifetime: MetadataLifetime.Always,
    },
  ]);
});

test('should watchForPersonMaxAmountByMonth', async (t) => {
  const [ctx] = setupStateless();
  watchForPersonMaxAmountByMonth(ctx, '1', MaximumTargetEnum.Passenger);
  t.deepEqual(ctx.meta.export(), [
    {
      uuid: '1',
      key: `max_amount_restriction.${MaximumTargetEnum.Passenger}-${ctx.carpool.passenger_identity_uuid}.month.0-2019`,
      initialValue: undefined,
      lifetime: MetadataLifetime.Month,
    },
  ]);
});

test('should watchForPersonMaxTripByMonth', async (t) => {
  const [ctx] = setupStateless();
  watchForPersonMaxTripByMonth(ctx, '1', MaximumTargetEnum.Passenger);
  t.deepEqual(ctx.meta.export(), [
    {
      uuid: '1',
      key: `max_trip_restriction.${MaximumTargetEnum.Passenger}-${ctx.carpool.passenger_identity_uuid}.month.0-2019`,
      initialValue: undefined,
      lifetime: MetadataLifetime.Month,
    },
  ]);
});

test('should watchForPersonMaxTripByDay', async (t) => {
  const [ctx] = setupStateless();
  watchForPersonMaxTripByDay(ctx, '1', MaximumTargetEnum.Driver);
  t.deepEqual(ctx.meta.export(), [
    {
      uuid: '1',
      key: `max_trip_restriction.${MaximumTargetEnum.Driver}-${ctx.carpool.driver_identity_uuid}.day.15-0-2019`,
      initialValue: undefined,
      lifetime: MetadataLifetime.Day,
    },
  ]);
});

test('should drop incentive if max is reached', async (t) => {
  const [ctx] = await setupStateful({
    meta: [
      {
        uuid: 'uuid',
        key: 'max_amount_restriction.global.campaign.global',
      },
    ],
  });
  ctx.meta.set('uuid', 10);
  applyForMaximum(ctx, 'uuid', 10, watchForGlobalMaxAmount);
  t.deepEqual(ctx.incentive.get(), 0);
  t.deepEqual(ctx.meta.export(), [{ policy_id: 1, key: 'max_amount_restriction.global.campaign.global', value: 10 }]);
});

test('should partially drop incentive if max will be reached', async (t) => {
  const [ctx] = await setupStateful({
    meta: [
      {
        uuid: 'uuid',
        key: 'max_amount_restriction.global.campaign.global',
      },
    ],
  });
  ctx.meta.set('uuid', 30);
  applyForMaximum(ctx, 'uuid', 100, watchForGlobalMaxAmount);
  t.deepEqual(ctx.incentive.get(), 70);
  t.deepEqual(ctx.meta.export(), [{ policy_id: 1, key: 'max_amount_restriction.global.campaign.global', value: 100 }]);
});

test('should increase meta if incentive is not null', async (t) => {
  const [ctx] = await setupStateful({
    meta: [
      {
        uuid: 'uuid',
        key: 'max_amount_restriction.global.campaign.global',
      },
    ],
  });
  ctx.meta.set('uuid', 30);
  applyForMaximum(ctx, 'uuid', 200, watchForGlobalMaxAmount);
  t.deepEqual(ctx.incentive.get(), 100);
  t.deepEqual(ctx.meta.export(), [{ policy_id: 1, key: 'max_amount_restriction.global.campaign.global', value: 130 }]);
});

test('should watch and apply', async (t) => {
  const [fnStateless, fnStateful] = setMax('uuid', 150, watchForGlobalMaxAmount);
  const [ctxStateless, carpool] = setupStateless();
  fnStateless(ctxStateless);
  t.deepEqual(ctxStateless.meta.export(), [
    {
      uuid: 'uuid',
      key: 'max_amount_restriction.global.campaign.global',
      initialValue: undefined,
      lifetime: MetadataLifetime.Always,
    },
  ]);
  ctxStateless.incentive.set(100);
  t.deepEqual(ctxStateless.incentive.export(), {
    _id: undefined,
    carpool_id: ctxStateless.carpool._id,
    datetime: ctxStateless.carpool.datetime,
    meta: ctxStateless.meta.export(),
    policy_id: ctxStateless.meta.policy_id,
    state: IncentiveStateEnum.Regular,
    status: IncentiveStatusEnum.Draft,
    statefulAmount: 100,
    statelessAmount: 100,
  });

  const [ctxStateful, store] = await setupStateful({ ...ctxStateless.incentive.export(), _id: 1 });
  t.deepEqual(ctxStateful.meta.export(), [
    { policy_id: 1, key: 'max_amount_restriction.global.campaign.global', value: 0 },
  ]);
  fnStateful(ctxStateful);
  t.is(ctxStateful.incentive.get(), 100);
  t.deepEqual(ctxStateful.meta.export(), [
    { policy_id: 1, key: 'max_amount_restriction.global.campaign.global', value: 100 },
  ]);
  await store.save(ctxStateful.meta);
  t.deepEqual(await store.store(MetadataLifetime.Day), [
    {
      key: 'max_amount_restriction.global.campaign.global',
      datetime: carpool.datetime,
      policy_id: 1,
      value: 100,
    },
  ]);
  fnStateful(ctxStateful);
  t.is(ctxStateful.incentive.get(), 50);
  t.deepEqual(ctxStateful.meta.export(), [
    { policy_id: 1, key: 'max_amount_restriction.global.campaign.global', value: 150 },
  ]);
  await store.save(ctxStateful.meta);
  t.deepEqual(await store.store(MetadataLifetime.Day), [
    {
      key: 'max_amount_restriction.global.campaign.global',
      datetime: carpool.datetime,
      policy_id: 1,
      value: 150,
    },
  ]);
});

test('should watch and apply for custom data', async (t) => {
  const [fnStateless, fnStateful] = setMax('uuid', 3, watchForPassengerMaxByTripByDay);
  const [ctxStateless, carpool] = setupStateless();
  fnStateless(ctxStateless);
  t.deepEqual(ctxStateless.meta.export(), [
    {
      uuid: 'uuid',
      key: `max_passenger_restriction.${carpool.trip_id}.day.15-0-2019`,
      initialValue: undefined,
      lifetime: MetadataLifetime.Day,
      carpoolValue: 1,
    },
  ]);
  ctxStateless.incentive.set(100);
  t.deepEqual(ctxStateless.incentive.export(), {
    _id: undefined,
    carpool_id: ctxStateless.carpool._id,
    datetime: ctxStateless.carpool.datetime,
    meta: ctxStateless.meta.export(),
    policy_id: ctxStateless.meta.policy_id,
    state: IncentiveStateEnum.Regular,
    status: IncentiveStatusEnum.Draft,
    statefulAmount: 100,
    statelessAmount: 100,
  });

  const [ctxStateful, store] = await setupStateful({ ...ctxStateless.incentive.export(), _id: 1 });
  t.deepEqual(ctxStateful.meta.export(), [
    { policy_id: 1, key: `max_passenger_restriction.${carpool.trip_id}.day.15-0-2019`, value: 0, carpoolValue: 1 },
  ]);

  fnStateful(ctxStateful);
  t.is(ctxStateful.incentive.get(), 100);
  t.deepEqual(ctxStateful.meta.export(), [
    { policy_id: 1, key: `max_passenger_restriction.${carpool.trip_id}.day.15-0-2019`, value: 1, carpoolValue: 1 },
  ]);
  await store.save(ctxStateful.meta);
  t.deepEqual(await store.store(MetadataLifetime.Day), []);

  fnStateful(ctxStateful);
  t.is(ctxStateful.incentive.get(), 100);
  t.deepEqual(ctxStateful.meta.export(), [
    { policy_id: 1, key: `max_passenger_restriction.${carpool.trip_id}.day.15-0-2019`, value: 2, carpoolValue: 1 },
  ]);
  await store.save(ctxStateful.meta);
  t.deepEqual(await store.store(MetadataLifetime.Day), []);
});
