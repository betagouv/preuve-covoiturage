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
import { description } from './Mrn.html';

export const Mrn: PolicyHandlerStaticInterface = class implements PolicyHandlerInterface {
  static readonly id = '766';
  protected operators = [OperatorsEnum.Klaxit];
  protected slices = [
    { start: 2000, end: 20000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 200) },
    { start: 20000, end: 40000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10 })) },
  ];
  protected limits = [
    setMax('489A7D57-1948-61DA-E5FA-1AE3217325BA', 80000000, watchForGlobalMaxAmount),
    setMax('E7B969E7-D701-2B9F-80D2-B30A7C3A5220', 6, watchForPersonMaxTripByDay, MaximumTargetEnum.Driver),
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
        glob: 80000000,
      },
    };
  }

  describe(): string {
    return description;
  }
};
