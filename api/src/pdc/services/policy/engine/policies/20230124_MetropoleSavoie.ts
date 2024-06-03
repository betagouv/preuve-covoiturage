import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from '../../interfaces';
import { RunnableSlices } from '../../interfaces/engine/PolicyInterface';
import {
  isOperatorClassOrThrow,
  isOperatorOrThrow,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perKm,
  perSeat,
  watchForGlobalMaxAmount,
} from '../helpers';
import { TimestampedOperators, getOperatorsAt } from '../helpers/getOperatorsAt';
import { startsAndEndsAtOrThrow } from '../helpers/startsAndEndsAtOrThrow';
import { description } from './20230124_MetropoleSavoie.html';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';

/* eslint-disable-next-line */
export const MetropoleSavoie: PolicyHandlerStaticInterface = class extends AbstractPolicyHandler implements PolicyHandlerInterface {
  static readonly id = 'metropole_savoie_2022';

  protected operators: TimestampedOperators = [
    {
      date: new Date('2023-01-24T00:00:00+0100'),
      operators: [OperatorsEnum.BLABLACAR_DAILY],
    },
  ];

  protected slices: RunnableSlices = [
    { start: 5_000, end: 20_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 200) },
    {
      start: 20_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10, offset: 20_000 })),
    },
  ];

  constructor(public max_amount: number) {
    super();
    this.limits = [['99911EAF-89AB-C346-DDD5-BD2C7704F935', max_amount, watchForGlobalMaxAmount]];
  }

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, getOperatorsAt(this.operators, ctx.carpool.datetime));
    onDistanceRangeOrThrow(ctx, { min: 5_000 });
    isOperatorClassOrThrow(ctx, ['B', 'C']);
    startsAndEndsAtOrThrow(ctx, { aom: ['200068674', '200069110'], epci: ['200041010'] });
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
