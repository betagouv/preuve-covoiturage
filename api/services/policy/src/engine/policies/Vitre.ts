import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from '../../interfaces';
import {
  ConfiguredLimitInterface,
  isOperatorClassOrThrow,
  isOperatorOrThrow,
  LimitTargetEnum,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perKm,
  perSeat,
  watchForGlobalMaxAmount,
  watchForPersonMaxAmountByMonth,
  watchForPersonMaxTripByDay,
} from '../helpers';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';
import { description } from './Vitre.html';

// Politique Vitré Communauté
export const Vitre: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface
{
  static readonly id = 'vitre';
  protected operators = [OperatorsEnum.Klaxit];
  protected slices = [
    { start: 2_000, end: 15_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 150) },
    {
      start: 15_000,
      end: 1_000_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10, offset: 15_000, limit: 30_000 })),
    },
  ];
  private readonly MAX_GLOBAL_AMOUNT_LIMIT = 180_000_00;

  protected limits: Array<ConfiguredLimitInterface> = [
    ['6456EC1D-2183-71DC-B08E-0B8FC30E4A4E', 2, watchForPersonMaxTripByDay, LimitTargetEnum.Passenger],
    ['A34719E4-DCA0-78E6-38E4-701631B106C2', 6, watchForPersonMaxTripByDay, LimitTargetEnum.Driver],
    ['ECDE3CD4-96FF-C9D2-BA88-45754205A798', 120_00, watchForPersonMaxAmountByMonth, LimitTargetEnum.Driver],
    ['B15AD9E9-BF92-70FA-E8F1-B526D1BB6D4F', this.MAX_GLOBAL_AMOUNT_LIMIT, watchForGlobalMaxAmount],
  ];

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, this.operators);
    onDistanceRangeOrThrow(ctx, { min: 2_000 });
    isOperatorClassOrThrow(ctx, ['B', 'C']);
  }

  processStateless(ctx: StatelessContextInterface): void {
    this.processExclusion(ctx);
    super.processStateless(ctx);

    // Par kilomètre
    let amount = 0;
    for (const { start, fn } of this.slices) {
      if (onDistanceRange(ctx, { min: start })) {
        amount += fn(ctx);
      }
    }

    ctx.incentive.set(amount);
  }

  params(): PolicyHandlerParamsInterface {
    return {
      slices: this.slices,
      operators: this.operators,
      limits: {
        glob: this.MAX_GLOBAL_AMOUNT_LIMIT,
      },
    };
  }

  describe(): string {
    return description;
  }
};
