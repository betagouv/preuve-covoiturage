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
  onDistanceRange,
  onDistanceRangeOrThrow,
  perKm,
  perSeat,
  watchForGlobalMaxAmount,
  watchForPersonMaxAmountByMonth,
  watchForPersonMaxTripByDay,
} from '../helpers';
import { LimitTargetEnum } from '../helpers/limits';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';
import { description } from './Montpellier.html';

/* eslint-disable-next-line */
export const Montpellier: PolicyHandlerStaticInterface = class extends AbstractPolicyHandler implements PolicyHandlerInterface {
  static readonly id = 'montpellier_2022';
  protected operators = [OperatorsEnum.KLAXIT];
  protected slices: RunnableSlices = [
    { start: 2_000, end: 10_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 100) },
    {
      start: 10_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10, offset: 10_000, limit: 20_000 })),
    },
  ];
  constructor(public max_amount: number) {
    super();
    this.limits = [
      ['56042464-852C-95B8-2009-8DD4808C9370', 6, watchForPersonMaxTripByDay, LimitTargetEnum.Driver],
      ['ECDE3CD4-96FF-C9D2-BA88-45754205A798', 150_00, watchForPersonMaxAmountByMonth, LimitTargetEnum.Driver],
      ['99911EAF-89AB-C346-DDD5-BD2C7704F935', max_amount, watchForGlobalMaxAmount],
    ];
  }

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, this.operators);
    onDistanceRangeOrThrow(ctx, { min: 2_000 });
    isOperatorClassOrThrow(ctx, ['B', 'C']);
  }

  processStateless(ctx: StatelessContextInterface): void {
    this.processExclusion(ctx);
    super.processStateless(ctx);

    // Calcul des incitations par tranche
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
