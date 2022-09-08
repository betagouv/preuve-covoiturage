import test from 'ava';
import { applyForMaximum, watchForGlobalMaxAmount, perKm, isOperatorClassOrThrow } from '../helpers';
import { process } from '../tests/macro';
import {
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  StatefulContextInterface,
  StatelessContextInterface,
} from '../../interfaces';

class TestHandler implements PolicyHandlerInterface {
  processStateless(ctx: StatelessContextInterface): void {
    isOperatorClassOrThrow(ctx, ['C']);
    ctx.incentive.set(perKm(ctx, { amount: 10 }));
    watchForGlobalMaxAmount(ctx, 'max');
  }

  processStateful(ctx: StatefulContextInterface): void {
    applyForMaximum(ctx, 'max', 2000);
  }

  describe() {
    return '';
  }

  params(): PolicyHandlerParamsInterface {
    return {};
  }
}

test(
  'should works if class C',
  process,
  { handler: new TestHandler(), carpool: [{ distance: 1000 }, { distance: 2000 }], meta: [] },
  { incentive: [10, 20], meta: [{ key: 'max_amount_restriction.global.campaign.global', value: 30 }] },
);

test(
  'should works if not class C',
  process,
  { handler: new TestHandler(), carpool: [{ distance: 1000, operator_class: 'B' }], meta: [] },
  { incentive: [0], meta: [] },
);

test(
  'should works with initial meta',
  process,
  {
    handler: new TestHandler(),
    carpool: [{ distance: 10000 }],
    meta: [{ key: 'max_amount_restriction.global.campaign.global', value: 1950 }],
  },
  { incentive: [50], meta: [{ key: 'max_amount_restriction.global.campaign.global', value: 2000 }] },
);

test(
  'should works with dates',
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
