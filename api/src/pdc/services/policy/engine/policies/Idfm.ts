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
  atDate,
  endsAt,
  isAfter,
  isOperatorClassOrThrow,
  isOperatorOrThrow,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perKm,
  perSeat,
  startsAt,
  watchForGlobalMaxAmount,
  watchForPersonMaxAmountByMonth,
  watchForPersonMaxTripByDay,
} from '../helpers';
import { LimitTargetEnum } from '../helpers/limits';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';
import { description } from './Idfm.html';

// Politique d'Île-de-France Mobilité
/* eslint-disable-next-line */
export const Idfm: PolicyHandlerStaticInterface = class extends AbstractPolicyHandler implements PolicyHandlerInterface {
  static readonly id = '459';

  constructor(public max_amount: number) {
    super();
    this.limits = [
      ['56042464-852C-95B8-2009-8DD4808C9370', 6, watchForPersonMaxTripByDay, LimitTargetEnum.Driver],
      ['ECDE3CD4-96FF-C9D2-BA88-45754205A798', 150_00, watchForPersonMaxAmountByMonth, LimitTargetEnum.Driver],
      ['99911EAF-89AB-C346-DDD5-BD2C7704F935', max_amount, watchForGlobalMaxAmount],
    ];
  }

  protected operators = [OperatorsEnum.BLABLACAR_DAILY, OperatorsEnum.KAROS, OperatorsEnum.KLAXIT, OperatorsEnum.YNSTANT];
  protected slices: RunnableSlices = [
    { start: 2_000, end: 15_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 150) },
    {
      start: 15_000,
      end: 30_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10, offset: 15_000, limit: 30_000 })),
    },
  ];

  protected boosterDates = [
    '2022-02-18',
    '2022-03-25',
    '2022-03-26',
    '2022-03-27',
    '2022-03-28',
    '2022-06-18',
    '2022-07-06',
    '2022-11-10',
    '2023-01-19',
    '2023-01-31',
    '2023-02-07',
    '2023-03-07',
    '2023-03-08',
    '2023-03-16',
    '2023-03-17',
    '2023-03-23',
    '2023-03-24',
    '2023-03-28',
    '2023-04-06',
    '2023-04-13',
    '2023-08-12',
    '2023-08-13',
    '2023-08-14',
  ];

  protected processExclusion(ctx: StatelessContextInterface) {
    // Ajout de mobicoop à partir du 2 janvier
    if (isAfter(ctx, { date: new Date('2023-03-22') })) {
      isOperatorOrThrow(ctx, this.operators);
    } else {
      isOperatorOrThrow(ctx, [OperatorsEnum.BLABLACAR_DAILY, OperatorsEnum.KAROS, OperatorsEnum.KLAXIT]);
    }
    onDistanceRangeOrThrow(ctx, { min: 2_000, max: 150_000 });

    // Exclure les trajet Paris-Paris
    if (startsAt(ctx, { com: ['75056'] }) && endsAt(ctx, { com: ['75056'] })) {
      throw new NotEligibleTargetException();
    }

    // Exclure les trajets qui ne sont pas dans l'aom
    // Code insee de l'aom IDFM 2022: 217500016
    // Code insee de l'aom IDFM 2023: 287500078
    if (
      (!startsAt(ctx, { aom: ['217500016'] }) || !endsAt(ctx, { aom: ['217500016'] })) &&
      (!startsAt(ctx, { aom: ['287500078'] }) || !endsAt(ctx, { aom: ['287500078'] }))
    ) {
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
    super.processStateless(ctx);

    // Par kilomètre
    let amount = 0;
    for (const { start, fn } of this.slices) {
      if (onDistanceRange(ctx, { min: start })) {
        amount += fn(ctx);
      }
    }

    // Jour de pollution/grève
    if (atDate(ctx, { dates: this.boosterDates })) {
      amount *= 1.5;
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
      booster_dates: [...this.boosterDates],
    };
  }

  describe(): string {
    return description;
  }
};
