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
  isOperatorClassOrThrow,
  isOperatorOrThrow,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perKm,
  perSeat,
  watchForGlobalMaxAmount,
  watchForPersonMaxTripByDay,
} from '../helpers';
import { TimestampedOperators, getOperatorsAt } from '../helpers/getOperatorsAt';
import { startsAndEndsAtOrThrow } from '../helpers/startsAndEndsAtOrThrow';
import { description } from './20240108_PetrLunevillois.html';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';

/* eslint-disable-next-line */
export const PetrLunevilloisS12023: PolicyHandlerStaticInterface = class extends AbstractPolicyHandler implements PolicyHandlerInterface {
  static readonly id = 'petr_lunevillois_s1_2023';

  protected operators: TimestampedOperators = [
    {
      date: new Date('2024-01-08T00:00:00+0100'),
      operators: [OperatorsEnum.MOBICOOP],
    },
  ];

  // 7 cts per km per passenger
  protected slices: RunnableSlices = [
    {
      start: 2_000,
      end: 60_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 7, offset: 2_000, limit: 60_000 })),
    },
  ];

  constructor(public max_amount: number) {
    super();
    this.limits = [
      ['99911EAF-89AB-C346-DDD5-BD2C7704F935', max_amount, watchForGlobalMaxAmount],
      ['70CE7566-6FD5-F850-C039-D76AF6F8CEB5', 2, watchForPersonMaxTripByDay, LimitTargetEnum.Driver],
    ];
  }

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, getOperatorsAt(this.operators, ctx.carpool.datetime));
    onDistanceRangeOrThrow(ctx, { min: 2_000, max: 60_000 });
    isOperatorClassOrThrow(ctx, ['C']);
    startsAndEndsAtOrThrow(ctx, { aom: ['200051134'] });
  }

  processStateless(ctx: StatelessContextInterface): void {
    this.processExclusion(ctx);
    super.processStateless(ctx);

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
};
