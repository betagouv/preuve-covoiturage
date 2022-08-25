import test from 'ava';
import { applyForMaximum, watchForGlobalMaxAmount, perKm } from '../helpers';
import { process } from '../tests/macro';
import { PolicyHandlerInterface, StatefulContextInterface, StatelessContextInterface } from '../../interfaces';

class TestHandler implements PolicyHandlerInterface {
  processStateless(ctx: StatelessContextInterface): void {
    ctx.incentive.set(perKm(ctx, { amount: 10 }));
    watchForGlobalMaxAmount(ctx, 'max');
  }

  processStateful(ctx: StatefulContextInterface): void {
    applyForMaximum(ctx, 'max', 2000);
  }

  describe() {
    return [];
  }

  describeForHuman(): string {
    return '';
  }
}

test(
  'should works with TestHandler',
  process,
  { handler: new TestHandler(), carpool: [{ distance: 1000 }, { distance: 2000 }], meta: [] },
  { incentive: [10, 20], meta: [{ key: 'max_amount_restriction.global.campaign.global', value: 30 }] },
);
