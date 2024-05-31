import test from 'ava';
import { applyLimitOnStatefulStage, watchForGlobalMaxAmount, perKm, isOperatorClassOrThrow } from '../helpers/index.ts';
import { process } from '../tests/macro.ts';
import {
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  StatefulContextInterface,
  StatelessContextInterface,
} from '../../interfaces/index.ts';

class TestHandler implements PolicyHandlerInterface {
  load(): Promise<void> {
    return;
  }
  processStateless(ctx: StatelessContextInterface): void {
    isOperatorClassOrThrow(ctx, ['C']);
    ctx.incentive.set(perKm(ctx, { amount: 10 }));
    watchForGlobalMaxAmount(ctx, 'max');
  }

  processStateful(ctx: StatefulContextInterface): void {
    applyLimitOnStatefulStage(ctx, 'max', 2000, watchForGlobalMaxAmount);
  }

  describe() {
    return '';
  }

  params(): PolicyHandlerParamsInterface {
    return {};
  }
}

test(
  'should work if class C',
  process,
  { handler: new TestHandler(), carpool: [{ distance: 1000 }, { distance: 2000 }], meta: [] },
  { incentive: [10, 20], meta: [{ key: 'max_amount_restriction.global.campaign.global', value: 30 }] },
);

test(
  'should work if not class C',
  process,
  { handler: new TestHandler(), carpool: [{ distance: 1000, operator_class: 'B' }], meta: [] },
  { incentive: [0], meta: [] },
);

test(
  'should work with initial meta',
  process,
  {
    handler: new TestHandler(),
    carpool: [{ distance: 10000 }],
    meta: [{ key: 'max_amount_restriction.global.campaign.global', value: 1950 }],
  },
  { incentive: [50], meta: [{ key: 'max_amount_restriction.global.campaign.global', value: 2000 }] },
);

test(
  'should work with dates',
  process,
  {
    handler: new TestHandler(),
    carpool: [
      { distance: 10000, datetime: new Date('2022-01-01') },
      { distance: 10000, datetime: new Date('2022-12-01') },
    ],
    meta: [],
  },
  { incentive: [100, 100], meta: [{ key: 'max_amount_restriction.global.campaign.global', value: 200 }] },
);

class MaxAmountPolicyHandler implements PolicyHandlerInterface {
  max_amount: number;

  constructor(max_amount: number) {
    this.max_amount = max_amount;
  }

  load(): Promise<void> {
    return;
  }
  processStateless(ctx: StatelessContextInterface): void {
    isOperatorClassOrThrow(ctx, ['C']);
    ctx.incentive.set(perKm(ctx, { amount: 10 }));
    watchForGlobalMaxAmount(ctx, 'max');
  }

  processStateful(ctx: StatefulContextInterface): void {
    applyLimitOnStatefulStage(ctx, 'max', this.max_amount, watchForGlobalMaxAmount);
  }

  describe() {
    return '';
  }

  params(): PolicyHandlerParamsInterface {
    return {};
  }
}

test(
  'should use constructor max amount',
  process,
  {
    handler: new MaxAmountPolicyHandler(60_000),
    carpool: [
      { distance: 10000, datetime: new Date('2022-01-01') },
      { distance: 10000, datetime: new Date('2022-12-01') },
    ],
    meta: [],
  },
  { incentive: [100, 100], meta: [{ key: 'max_amount_restriction.global.campaign.global', value: 200 }] },
);
