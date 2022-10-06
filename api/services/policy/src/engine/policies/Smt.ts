import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatefulContextInterface,
  StatelessContextInterface,
} from '../../interfaces';
import {
  isOperatorClassOrThrow,
  isOperatorOrThrow,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perKm,
  perSeat,
  configureLimit,
  watchForGlobalMaxAmount,
  watchForPersonMaxTripByDay,
  LimitTargetEnum,
  ConfiguredLimitInterface,
} from '../helpers';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';
import { description } from './Smt.html';

// Politique du Syndicat des Mobilités de Touraine
export const Smt: PolicyHandlerStaticInterface = class extends AbstractPolicyHandler implements PolicyHandlerInterface {
  static readonly id = '713';
  protected operators = [OperatorsEnum.Klaxit];
  protected slices = [
    { start: 2_000, end: 20_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 200) },
    {
      start: 20_000,
      end: 40_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10, offset: 20_000, limit: 40_000 })),
    },
  ];
  protected limits: Array<ConfiguredLimitInterface> = [
    ['A34719E4-DCA0-78E6-38E4-701631B106C2', 6, watchForPersonMaxTripByDay, LimitTargetEnum.Driver],
    ['B15AD9E9-BF92-70FA-E8F1-B526D1BB6D4F', 40_000_00, watchForGlobalMaxAmount],
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
    for (const { start, fn } of this.slices) {
      if (onDistanceRange(ctx, { min: start })) {
        amount += fn(ctx);
      }
    }

    amount += ctx.carpool.cost;
    ctx.incentive.set(amount);
  }

  params(): PolicyHandlerParamsInterface {
    return {
      slices: this.slices,
      operators: this.operators,
      limits: {
        glob: 40_000_00,
      },
    };
  }

  describe(): string {
    return description;
  }
};
