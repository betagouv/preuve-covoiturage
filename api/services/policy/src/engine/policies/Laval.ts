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
  onDistanceRange,
  onDistanceRangeOrThrow,
  perSeat,
  watchForGlobalMaxAmount,
  watchForPersonMaxTripByDay,
  LimitTargetEnum,
  ConfiguredLimitInterface,
} from '../helpers';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';
import { description } from './Laval.html';

// Politique de la Communauté D'Agglomeration De Laval
export const Laval: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface
{
  static readonly id = '695';
  protected operators = [OperatorsEnum.Klaxit];
  protected slices = [{ start: 2_000, end: 150_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 50) }];
  private readonly MAX_GLOBAL_AMOUNT_LIMIT = 9_000_00;

  protected limits: Array<ConfiguredLimitInterface> = [
    ['70CE7566-6FD5-F850-C039-D76AF6F8CEB5', 6, watchForPersonMaxTripByDay, LimitTargetEnum.Driver],
    ['A2CEF9FE-D179-319F-1996-9D69E0157522', this.MAX_GLOBAL_AMOUNT_LIMIT, watchForGlobalMaxAmount],
  ];

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
      slices: this.slices,
      operators: this.operators,
      limits: {
        glob: 9_000_00,
      },
    };
  }

  describe(): string {
    return description;
  }
};
