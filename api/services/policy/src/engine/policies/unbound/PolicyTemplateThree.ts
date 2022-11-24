import {
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from '../../../interfaces';
import {
  ConfiguredLimitInterface,
  isOperatorClassOrThrow,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perSeat,
} from '../../helpers';
import { AbstractPolicyHandler } from '../AbstractPolicyHandler';

export const PolicyTemplateThree: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface
{
  params(): PolicyHandlerParamsInterface {
    throw new Error('Method not implemented.');
  }
  describe(): string {
    throw new Error('Method not implemented.');
  }

  static readonly id = '3';

  protected slices = [{ start: 2_000, end: 150_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 50) }];

  processStateless(ctx: StatelessContextInterface): void {
    this.processExclusion(ctx);
    // Par kilomètre
    let amount = 0;
    for (const { start, fn } of this.slices) {
      if (onDistanceRange(ctx, { min: start })) {
        amount += fn(ctx);
      }
    }

    ctx.incentive.set(amount);
  }
  processExclusion(ctx: StatelessContextInterface) {
    isOperatorClassOrThrow(ctx, ['B', 'C']);
    onDistanceRangeOrThrow(ctx, { min: 2_000, max: 150_000 });
  }

  protected limits: Array<ConfiguredLimitInterface> = [];
};
