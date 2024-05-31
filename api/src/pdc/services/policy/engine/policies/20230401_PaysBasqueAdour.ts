import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from '../../interfaces';
import { RunnableSlices } from '../../interfaces/engine/PolicyInterface';
import {
  LimitTargetEnum,
  isAdultOrThrow,
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
import { TimestampedOperators, getOperatorsAt } from '../helpers/getOperatorsAt';
import { description } from './20230401_PaysBasqueAdour.html';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';

// Pays Basque Adour
export const PaysBasque20232024: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface
{
  static readonly id = 'pays_basque_2023';

  protected operators: TimestampedOperators = [
    {
      date: new Date('2023-04-01T00:00:00+0200'),
      operators: [OperatorsEnum.KLAXIT, OperatorsEnum.MOBICOOP, OperatorsEnum.BLABLACAR_DAILY, OperatorsEnum.KAROS],
    },
    {
      date: new Date('2024-01-01T00:00:00+0100'),
      operators: [OperatorsEnum.KLAXIT, OperatorsEnum.BLABLACAR_DAILY, OperatorsEnum.KAROS],
    },
  ];

  protected slices: RunnableSlices = [
    { start: 5_000, end: 20_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 200) },
    {
      start: 20_000,
      end: 30_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10, offset: 20_000, limit: 30_000 })),
    },
  ];

  constructor(public max_amount: number) {
    super();
    this.limits = [
      ['A34719E4-DCA0-78E6-38E4-701631B106C2', 6, watchForPersonMaxTripByDay, LimitTargetEnum.Driver],
      ['ECDE3CD4-96FF-C9D2-BA88-45754205A798', 150_00, watchForPersonMaxAmountByMonth, LimitTargetEnum.Driver],
      ['B15AD9E9-BF92-70FA-E8F1-B526D1BB6D4F', this.max_amount, watchForGlobalMaxAmount],
    ];
  }

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, getOperatorsAt(this.operators, ctx.carpool.datetime));
    onDistanceRangeOrThrow(ctx, {
      min: 5_000,
      max: this.applyRuleChangeFor2024(ctx) ? 80_000 : 100_000,
    });
    isOperatorClassOrThrow(ctx, ['C']);
    isAdultOrThrow(ctx);
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
      operators: getOperatorsAt(this.operators),
      limits: {
        glob: this.max_amount,
      },
    };
  }

  describe(): string {
    return description;
  }

  private applyRuleChangeFor2024(ctx: StatelessContextInterface) {
    return ctx.carpool.datetime >= this.operators[1].date;
  }
};
