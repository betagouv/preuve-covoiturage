import {
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from '../../interfaces';
import { ConfiguredLimitInterface, onDistanceRange, perKm, perSeat } from '../helpers';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';

export const PolicyTemplateOne: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface
{
  params(): PolicyHandlerParamsInterface {
    throw new Error('Method not implemented.');
  }
  describe(): string {
    throw new Error('Method not implemented.');
  }

  static readonly id = '1';

  protected slices = [
    { start: 2_000, end: 20_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 200) },
    {
      start: 20_000,
      end: 50_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10, offset: 20_000, limit: 50_000 })),
    },
    {
      start: 50_000,
      end: 150_000,
      fn: () => 0,
    },
  ];

  processStateless(ctx: StatelessContextInterface): void {
    // Par kilomètre
    let amount = 0;
    for (const { start, fn } of this.slices) {
      if (onDistanceRange(ctx, { min: start })) {
        amount += fn(ctx);
      }
    }

    ctx.incentive.set(amount);
  }

  protected limits: Array<ConfiguredLimitInterface> = [];
};
