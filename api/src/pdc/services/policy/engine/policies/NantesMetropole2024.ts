import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from '../../interfaces';
import { RunnableSlices } from '../../interfaces/engine/PolicyInterface';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import {
  LimitTargetEnum,
  endsAt,
  isOperatorClassOrThrow,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perKm,
  perSeat,
  startsAt,
  watchForGlobalMaxAmount,
  watchForPersonMaxAmountByMonth,
  watchForPersonMaxTripByDay,
} from '../helpers';
import { isAdultOrThrow } from '../helpers/isAdultOrThrow';
import { watchForPersonMaxAmountByYear } from '../helpers/limits';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';
import { description } from './NantesMetropole2024.html';

// Politique de Pays de la Loire 2024
/* eslint-disable-next-line */
export const NantesMetropole2024: PolicyHandlerStaticInterface = class extends AbstractPolicyHandler implements PolicyHandlerInterface {
  static readonly id = 'pdll_2024';
  protected operators = [OperatorsEnum.BlaBlaDaily, OperatorsEnum.Karos, OperatorsEnum.Klaxit, OperatorsEnum.Mobicoop];
  protected slices: RunnableSlices = [
    { start: 5_000, end: 17_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 75) },
    {
      start: 17_000,
      end: 30_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10, offset: 17_000, limit: 30_000 })),
    },
    {
      start: 30_000,
      end: 60_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, 200),
    },
  ];

  constructor(public max_amount: number) {
    super();
    this.limits = [
      ['01A68CC8-DFEA-4DA9-8957-5BB702F17D89', this.max_amount, watchForGlobalMaxAmount],
      ['69A0BFF8-D6F3-4DC9-8159-27CC8115AF48', 6, watchForPersonMaxTripByDay, LimitTargetEnum.Driver],
      ['CC5F5094-8431-4EA3-AC60-F51A75374356', 84_00, watchForPersonMaxAmountByMonth, LimitTargetEnum.Driver],
      ['76004F3C-6999-47E6-B273-E9799DB3399F', 1008_00, watchForPersonMaxAmountByYear, LimitTargetEnum.Driver],
    ];
  }

  protected processExclusion(ctx: StatelessContextInterface) {
    onDistanceRangeOrThrow(ctx, { min: 5_000, max: 60_001 });
    isOperatorClassOrThrow(ctx, ['C']);
    isAdultOrThrow(ctx);

    // Exclure les trajets qui ne sont pas de l'AOM
    if (!startsAt(ctx, { aom: ['244400404'] }) || !endsAt(ctx, { aom: ['244400404'] })) {
      throw new NotEligibleTargetException();
    }
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
