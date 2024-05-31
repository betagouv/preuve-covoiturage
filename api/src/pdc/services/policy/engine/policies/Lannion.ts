import { RunnableSlices } from '../../interfaces/engine/PolicyInterface.ts';
import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from '../../interfaces/index.ts';
import {
  ensureFreeRide,
  isOperatorClassOrThrow,
  isOperatorOrThrow,
  LimitTargetEnum,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perKm,
  perSeat,
  watchForGlobalMaxAmount,
  watchForPersonMaxTripByDay,
} from '../helpers/index.ts';
import { AbstractPolicyHandler } from './AbstractPolicyHandler.ts';
import { description } from './Lannion.html.ts';

// Politique de la Communauté D'Agglomeration De Lannion-Tregor
export const Lannion: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface
{
  static readonly id = 'lannion_2022';

  constructor(public max_amount: number) {
    super();
    this.limits = [
      ['CDCC69D1-0E76-E109-F87D-1D3AD738EFB2', 6, watchForPersonMaxTripByDay, LimitTargetEnum.Driver],
      ['9E35A0F7-AA0B-5D94-AA79-66F5F3677934', this.max_amount, watchForGlobalMaxAmount],
    ];
  }

  protected operators = [OperatorsEnum.KLAXIT];
  protected slices: RunnableSlices = [
    { start: 2_000, end: 20_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 200) },
    {
      start: 20_000,
      end: 40_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10, offset: 20_000, limit: 40_000 })),
    },
  ];

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, this.operators);
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
