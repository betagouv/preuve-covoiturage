import { RunnableSlices } from '../../interfaces/engine/PolicyInterface';
import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from '../../interfaces';
import {
  isOperatorClassOrThrow,
  isOperatorOrThrow,
  LimitTargetEnum,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perSeat,
  watchForGlobalMaxAmount,
  watchForPersonMaxTripByDay,
} from '../helpers';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';
import { description } from './Laval.html';

// Politique de la Communauté D'Agglomeration De Laval
export const Laval: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface
{
  static readonly id = '695';

  constructor(public max_amount: number) {
    super();
    this.limits = [
      ['70CE7566-6FD5-F850-C039-D76AF6F8CEB5', 6, watchForPersonMaxTripByDay, LimitTargetEnum.Driver],
      ['A2CEF9FE-D179-319F-1996-9D69E0157522', max_amount, watchForGlobalMaxAmount],
    ];
  }

  protected operators = [OperatorsEnum.Klaxit];
  protected slices: RunnableSlices = [{ start: 2_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 50) }];

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, this.operators);
    onDistanceRangeOrThrow(ctx, { min: 2_000, max: 150_000 });
    isOperatorClassOrThrow(ctx, ['B', 'C']);
  }

  processStateless(ctx: StatelessContextInterface): void {
    this.processExclusion(ctx);
    super.processStateless(ctx);

    // Par kilomètre
    let amount = 0;
    for (const { start, end, fn } of this.slices) {
      if (onDistanceRange(ctx, { min: start, max: end })) {
        amount = fn(ctx);
      }
    }

    ctx.incentive.set(amount);
  }

  params(): PolicyHandlerParamsInterface {
    return {
      tz: 'Europe/Paris',
      slices: this.slices,
      operators: this.operators,
      limits: {
        glob: this.max_amount,
      },
    };
  }

  describe(): string {
    return description;
  }
};
