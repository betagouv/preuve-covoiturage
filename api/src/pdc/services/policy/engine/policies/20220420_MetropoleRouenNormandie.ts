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
  ensureFreeRide,
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
import { description } from './20220420_MetropoleRouenNormandie.html';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';

// Politique de Métropole Rouen Normandie
export const MetropoleRouenNormandie2022: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface
{
  static readonly id = '766';

  protected operators: TimestampedOperators = [
    {
      date: new Date('2021-01-05T00:00:00+0100'),
      operators: [OperatorsEnum.KLAXIT],
    },
  ];

  protected slices: RunnableSlices = [
    { start: 2_000, end: 20_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 200) },
    {
      start: 20_000,
      end: 40_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10, offset: 20_000, limit: 40_000 })),
    },
  ];

  constructor(public max_amount: number) {
    super();
    this.limits = [
      ['E7B969E7-D701-2B9F-80D2-B30A7C3A5220', 6, watchForPersonMaxTripByDay, LimitTargetEnum.Driver],
      ['489A7D57-1948-61DA-E5FA-1AE3217325BA', max_amount, watchForGlobalMaxAmount],
    ];
  }

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, getOperatorsAt(this.operators, ctx.carpool.datetime));
    onDistanceRangeOrThrow(ctx, { min: 2_000, max: 150_000 });
    isOperatorClassOrThrow(ctx, ['B', 'C']);
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

    amount += ensureFreeRide(ctx, amount);

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
