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
  setMax,
  watchForGlobalMaxAmount,
  watchForPersonMaxTripByDay,
} from '../helpers';
import { MaximumTargetEnum } from '../helpers/max';
import { description } from './Smt.html';

export const Smt: PolicyHandlerStaticInterface = class implements PolicyHandlerInterface {
  static readonly id = '713';
  protected operators = [OperatorsEnum.Klaxit];
  protected slices = [
    { start: 2000, end: 20000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 200) },
    { start: 20000, end: 40000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10 })) },
  ];
  protected limits = [
    setMax('B15AD9E9-BF92-70FA-E8F1-B526D1BB6D4F', 4000000, watchForGlobalMaxAmount),
    setMax('A34719E4-DCA0-78E6-38E4-701631B106C2', 6, watchForPersonMaxTripByDay, MaximumTargetEnum.Driver),
  ];

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, this.operators);
    onDistanceRangeOrThrow(ctx, { min: 2000, max: 150000 });
    isOperatorClassOrThrow(ctx, ['B', 'C']);
  }

  processStateless(ctx: StatelessContextInterface): void {
    this.processExclusion(ctx);

    // Mise en place des limites
    for (const limit of this.limits) {
      const [staless] = limit;
      staless(ctx);
    }

    // Par kilomètre
    let amount = 0;
    for (const { start, end, fn } of this.slices) {
      if (onDistanceRange(ctx, { min: start, max: end })) {
        amount = fn(ctx);
      }
    }

    // TODO gratuit pour les passager de 2 à 150km

    ctx.incentive.set(amount);
  }

  processStateful(ctx: StatefulContextInterface): void {
    for (const limit of this.limits) {
      const [, stateful] = limit;
      stateful(ctx);
    }
  }

  params(): PolicyHandlerParamsInterface {
    return {
      slices: this.slices,
      operators: this.operators,
      limits: {
        glob: 4000000,
      },
    };
  }

  describe(): string {
    return description;
  }
};
