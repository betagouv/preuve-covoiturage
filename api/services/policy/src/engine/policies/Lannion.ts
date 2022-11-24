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
  onDistanceRange,
  onDistanceRangeOrThrow,
  perSeat,
  watchForGlobalMaxAmount,
  watchForPersonMaxTripByDay,
  LimitTargetEnum,
  ConfiguredLimitInterface,
  perKm,
} from '../helpers';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';
import { description } from './Lannion.html';

// Politique de la Communauté D'Agglomeration De Lannion-Tregor
export const Lannion: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface
{
  static readonly id = 'lannion_2022';
  protected glob_limit = 60_684_87;
  protected operators = [OperatorsEnum.Klaxit];
  protected slices = [
    { start: 2_000, end: 20_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 200) },
    {
      start: 20_000,
      end: 40_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10, offset: 20_000, limit: 40_000 })),
    },
    { start: 40_000, end: 150_000, fn: () => 0 },
  ];
  protected limits: Array<ConfiguredLimitInterface> = [
    ['CDCC69D1-0E76-E109-F87D-1D3AD738EFB2', 6, watchForPersonMaxTripByDay, LimitTargetEnum.Driver],
    ['9E35A0F7-AA0B-5D94-AA79-66F5F3677934', this.glob_limit, watchForGlobalMaxAmount],
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

    // Gratuité passager
    amount += ctx.carpool.cost;
    ctx.incentive.set(amount);
  }

  params(): PolicyHandlerParamsInterface {
    return {
      slices: this.slices,
      operators: this.operators,
      limits: {
        glob: this.glob_limit,
      },
    };
  }

  describe(): string {
    return description;
  }
};
