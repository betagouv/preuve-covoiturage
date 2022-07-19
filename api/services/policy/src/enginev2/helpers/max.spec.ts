import test from 'ava';

import { StatefulContext, StatelessContext } from '../entities/Context';
import { MetadataStore } from '../entities/MetadataStore';
import { SerializedIncentiveInterface } from '../interfaces';
import { generateCarpool, generateIncentive } from '../tests/helpers';
import { applyForMaximum, watchForGlobalMaxAmount, watchForPersonMaxAmountByMonth, watchForPersonMaxTripByDay, watchForPersonMaxTripByMonth } from './max';

function setupStateless() {
  return StatelessContext.fromCarpool(1, generateCarpool());
}

async function setupStateful(data: Partial<SerializedIncentiveInterface> = {}) {
  return await StatefulContext.fromIncentive(new MetadataStore, generateIncentive(data));
}

test('should watchForGlobalMaxAmount', async (t) => {
  const ctx = setupStateless();
  watchForGlobalMaxAmount(ctx, '1'); 
  t.deepEqual(ctx.meta.export(), [{
    uuid: '1',
    key: 'max_amount_restriction.global.campaign.global',
  }]);
});

test('should watchForPersonMaxAmountByMonth', async (t) => {
  const ctx = setupStateless();
  watchForPersonMaxAmountByMonth(ctx, '1'); 
  t.deepEqual(ctx.meta.export(), [{
    uuid: '1',
    key: `max_amount_restriction.${ctx.carpool.identity_uuid}.month.0-2019`,
  }]);
});

test('should watchForPersonMaxTripByMonth', async (t) => {
  const ctx = setupStateless();
  watchForPersonMaxTripByMonth(ctx, '1'); 
  t.deepEqual(ctx.meta.export(), [{
    uuid: '1',
    key: `max_trip_restriction.${ctx.carpool.identity_uuid}.month.0-2019`,
  }]);
});

test('should watchForPersonMaxTripByDay', async (t) => {
  const ctx = setupStateless();
  watchForPersonMaxTripByDay(ctx, '1'); 
  t.deepEqual(ctx.meta.export(), [{
    uuid: '1',
    key: `max_trip_restriction.${ctx.carpool.identity_uuid}.day.15-0-2019`,
  }]);
});

test('should drop incentive if max is reached', async (t) => {
  const ctx = await setupStateful();
  ctx.meta.set('uuid', 10);
  applyForMaximum(ctx, 'uuid', 10);
  t.deepEqual(ctx.incentive.get(), 0);
  t.deepEqual(ctx.meta.export(), [{ key: 'uuid', value: 10 }]);
});

test('should partially drop incentive if max will be reached', async (t) => {
  const ctx = await setupStateful();
  ctx.meta.set('uuid', 30);
  applyForMaximum(ctx, 'uuid', 100);
  t.deepEqual(ctx.incentive.get(), 70);
  t.deepEqual(ctx.meta.export(), [{ key: 'uuid', value: 100 }]);
});

test('should increase meta if incentive is not null', async (t) => {
  const ctx = await setupStateful();
  ctx.meta.set('uuid', 30);
  applyForMaximum(ctx, 'uuid', 200);
  t.deepEqual(ctx.incentive.get(), 100);
  t.deepEqual(ctx.meta.export(), [{ key: 'uuid', value: 130 }]);
});
