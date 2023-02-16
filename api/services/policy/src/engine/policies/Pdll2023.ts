import { RunnableSlices } from '../../interfaces/engine/PolicyInterface';
import {
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from '../../interfaces';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import {
  endsAt,
  isOperatorClassOrThrow,
  LimitTargetEnum,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perKm,
  perSeat,
  startsAndEndsAt,
  startsAt,
  watchForGlobalMaxAmount,
  watchForPersonMaxTripByDay,
} from '../helpers';
import { isAdultOrThrow } from './../helpers/isAdultOrThrow';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';
import { description } from './Pdll.html';

// Politique de Pays de la Loire
/* eslint-disable-next-line */
export const Pdll2023: PolicyHandlerStaticInterface = class extends AbstractPolicyHandler implements PolicyHandlerInterface {
  static readonly id = 'pdll_2023';
  protected slices: RunnableSlices = [
    { start: 2_000, end: 20_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 100) },
    {
      start: 20_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10, offset: 20_000, limit: 40_000 })),
    },
  ];

  constructor(public max_amount: number) {
    super();
    this.limits = [
      ['8C5251E8-AB82-EB29-C87A-2BF59D4F6328', 6, watchForPersonMaxTripByDay, LimitTargetEnum.Driver],
      ['5499304F-2C64-AB1A-7392-52FF88F5E78D', this.max_amount, watchForGlobalMaxAmount],
    ];
  }

  protected processExclusion(ctx: StatelessContextInterface) {
    onDistanceRangeOrThrow(ctx, { min: 5_000, max: 80_001 });
    isOperatorClassOrThrow(ctx, ['C']);
    isAdultOrThrow(ctx);

    /*
     Exclure les trajets :
     - NM->NM, 
     - Angers->Angers,
     - Le Mans->Le Mans, 
     - CA Agglomération du Choletais->CA Agglomération du Choletais
     */
    if (
      startsAndEndsAt(ctx, { aom: ['244900015'] }) ||
      startsAndEndsAt(ctx, { aom: ['244400404'] }) ||
      startsAndEndsAt(ctx, { aom: ['247200132'] }) ||
      startsAndEndsAt(ctx, { aom: ['200071678'] })
    ) {
      throw new NotEligibleTargetException();
    }

    // Exclure les trajets qui ne sont pas dans l'aom
    if (!startsAt(ctx, { reg: ['52'] }) || !endsAt(ctx, { reg: ['52'] })) {
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
      slices: this.slices,
      limits: {
        glob: this.max_amount,
      },
    };
  }

  describe(): string {
    return description;
  }
};
