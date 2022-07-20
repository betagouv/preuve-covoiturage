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
} from '../interfaces';
import { generateCarpool, generateIncentive } from '../tests/helpers';
import {
  applyForMaximum,
  setMax,
  watchForGlobalMaxAmount,
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
    },
  ]);
});

test('should watchForPersonMaxAmountByMonth', async (t) => {
  const [ctx] = setupStateless();
  watchForPersonMaxAmountByMonth(ctx, '1');
  t.deepEqual(ctx.meta.export(), [
    {
      uuid: '1',
      key: `max_amount_restriction.${ctx.carpool.identity_uuid}.month.0-2019`,
    },
  ]);
});

test('should watchForPersonMaxTripByMonth', async (t) => {
  const [ctx] = setupStateless();
  watchForPersonMaxTripByMonth(ctx, '1');
  t.deepEqual(ctx.meta.export(), [
    {
      uuid: '1',
      key: `max_trip_restriction.${ctx.carpool.identity_uuid}.month.0-2019`,
    },
  ]);
});

test('should watchForPersonMaxTripByDay', async (t) => {
  const [ctx] = setupStateless();
  watchForPersonMaxTripByDay(ctx, '1');
  t.deepEqual(ctx.meta.export(), [
    {
      uuid: '1',
      key: `max_trip_restriction.${ctx.carpool.identity_uuid}.day.15-0-2019`,
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
  applyForMaximum(ctx, 'uuid', 10);
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
  applyForMaximum(ctx, 'uuid', 100);
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
  applyForMaximum(ctx, 'uuid', 200);
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
