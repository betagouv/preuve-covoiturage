import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import {
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  StatefulContextInterface,
  StatelessContextInterface,
} from '../../interfaces';
import {
  atDate,
  isAfter,
  isDriverOrThrow,
  isOperatorClassOrThrow,
  isOperatorOrThrow,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perKm,
  perSeat,
  endsAt,
  startsAt,
  setMax,
  watchForGlobalMaxAmount,
  watchForPersonMaxAmountByMonth,
  watchForPersonMaxTripByDay,
} from '../helpers';

export class Idfm implements PolicyHandlerInterface {
  static readonly id = 'Idfm';
  protected operators = [
    '80279897500024', // Karos
    '75315323800047', // Klaxit
    '49190454600034', // BBC
  ];
  protected slices = [
    { start: 2000, end: 15000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 150) },
    { start: 15000, end: 30000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10 })) },
  ];
  protected limits = [
    setMax('99911EAF-89AB-C346-DDD5-BD2C7704F935', 600000000, watchForGlobalMaxAmount),
    setMax('ECDE3CD4-96FF-C9D2-BA88-45754205A798', 15000, watchForPersonMaxAmountByMonth),
    setMax('56042464-852C-95B8-2009-8DD4808C9370', 6, watchForPersonMaxTripByDay, true),
  ];
  protected pollutionAndStrikeDates = [
    '2022-02-18',
    '2022-03-25',
    '2022-03-26',
    '2022-03-27',
    '2022-03-28',
    '2022-06-18',
    '2022-07-06',
  ];

  protected processExclusion(ctx: StatelessContextInterface) {
    isDriverOrThrow(ctx);
    isOperatorOrThrow(ctx, this.operators);
    onDistanceRangeOrThrow(ctx, { min: 2000, max: 150000 });

    // Exclure les trajet Paris-Paris
    if (startsAt(ctx, { com: ['75056'] }) && endsAt(ctx, { com: ['75056'] })) {
      throw new NotEligibleTargetException();
    }

    // Exclure les trajets qui ne sont pas dans l'aom
    if (!startsAt(ctx, { aom: ['217500016'] }) || !endsAt(ctx, { aom: ['217500016'] })) {
      throw new NotEligibleTargetException();
    }

    // Classe de trajet
    isOperatorClassOrThrow(ctx, ['B', 'C']);
    // Modification de la campagne au 1er septembre
    if (isAfter(ctx, { date: new Date('2022-09-01') })) {
      isOperatorClassOrThrow(ctx, ['C']);
    }
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

    // Jour de pollution
    if (atDate(ctx, { dates: this.pollutionAndStrikeDates })) {
      amount *= 1.5;
    }

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
    };
  }

  describe(): string {
    return `Decrire la campagne pour le frontend`;
  }
}
