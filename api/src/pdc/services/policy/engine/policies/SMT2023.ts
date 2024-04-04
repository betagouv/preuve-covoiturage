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
import { description } from './SMT2023.html';
import { dateWithTz, today } from '../../helpers';

// Politique du Syndicat des Mobilités de Touraine
export const SMT2023: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface
{
  static readonly id = 'smt_2023';
  protected operators = [OperatorsEnum.KLAXIT];
  protected new_operators = [OperatorsEnum.KLAXIT, OperatorsEnum.BLABLACAR_DAILY];

  protected relaunch_update_date = new Date('15/02/2024');

  protected slices: RunnableSlices = [
    { start: 2_000, end: 20_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 200) },
    {
      start: 20_000,
      end: 40_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10, offset: 20_000, limit: 40_000 })),
    },
  ];

  protected slices_after_april: RunnableSlices = [
    { start: 2_000, end: 20_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 200) },
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
      // 120€ to 150€ from 15/02/2024
      ['ECDE3CD4-96FF-C9D2-BA88-45754205A798', 150_00, watchForPersonMaxAmountByMonth, LimitTargetEnum.Driver],
      ['B15AD9E9-BF92-70FA-E8F1-B526D1BB6D4F', this.max_amount, watchForGlobalMaxAmount],
    ];
  }

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, this.isAfter15February2024(ctx.carpool.datetime) ? this.new_operators : this.operators);
    isOperatorClassOrThrow(ctx, ['B', 'C']);
    onDistanceRangeOrThrow(
      ctx,
      this.isAfter15April2023(ctx.carpool.datetime) ? { min: 2_000, max: 30_001 } : { min: 2_000 },
    );
  }

  processStateless(ctx: StatelessContextInterface): void {
    this.processExclusion(ctx);
    super.processStateless(ctx);

    // Par kilomètre
    let amount = 0;
    for (const { start, fn } of this.getSlices()) {
      if (onDistanceRange(ctx, { min: start })) {
        amount += fn(ctx);
      }
    }

    ctx.incentive.set(amount);
  }

  private getSlices() {
    return this.isAfter15April2023(today()) ? this.slices_after_april : this.slices;
  }

  private isAfter15February2024(date: Date): boolean {
    return date >= dateWithTz(new Date('2024-02-15'));
  }

  private isAfter15April2023(date: Date): boolean {
    return date >= dateWithTz(new Date('2023-04-15'));
  }

  params(): PolicyHandlerParamsInterface {
    return {
      tz: 'Europe/Paris',
      slices: this.getSlices(),
      operators: this.new_operators,
      limits: {
        glob: this.max_amount,
      },
    };
  }

  describe(): string {
    return description;
  }
};
