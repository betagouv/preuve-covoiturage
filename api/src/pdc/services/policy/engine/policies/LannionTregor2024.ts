import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
  TerritoryCodeEnum,
  TerritorySelectorsInterface,
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
  startsAndEndsAt,
  watchForGlobalMaxAmount,
  watchForPersonMaxAmountByMonth,
  watchForPersonMaxTripByDay,
} from '../helpers';
import { TimestampedOperators, getOperatorsAt } from '../helpers/getOperatorsAt';
import { startsOrEndsAtOrThrow } from '../helpers/startsOrEndsAtOrThrow';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';
import { description } from './LannionTregor2024.html';

// INSERT INTO policy.policies (territory_id, start_date, end_date, name, unit, status, handler, max_amount)
// VALUES (
//   321,
//   '2024-04-01T00:00:00+0200',
//   '2025-01-01T00:00:00+0100',
//   'Lannion-Trégor 2024',
//   'euro',
//   'draft',
//   'lannion_tregor_2024',
//   14490600
// );

export const LannionTregor2024: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface
{
  static readonly id = 'lannion_tregor_2024';

  protected operator_class = ['B', 'C'];

  protected readonly operators: TimestampedOperators = [
    {
      date: new Date('2024-04-01T00:00:00+0200'),
      operators: [OperatorsEnum.BLABLACAR_DAILY],
    },
  ];

  protected readonly territorySelector: TerritorySelectorsInterface = {
    [TerritoryCodeEnum.Mobility]: ['200065928'], // CA Lannion-Trégor Communauté
  };

  constructor(public max_amount: number) {
    super();
    this.limits = [
      ['2F2434E3-D2A5-428E-8027-8FD8C62F508B', 6, watchForPersonMaxTripByDay, LimitTargetEnum.Driver],
      ['664572FC-0873-4F2F-9B42-BDDAF291BB73', 150_00, watchForPersonMaxAmountByMonth, LimitTargetEnum.Driver],
      ['E7CC1FDC-65DB-4A88-A134-ECE3773B1293', this.max_amount, watchForGlobalMaxAmount], // required
    ];
  }

  /**
   * Trajets extra-AOM (origine OU destination dans l'AOM)
   * - 1,50€ par passager de 2 à 20 km
   * - 1,50€ par passager + 0,10€ pour les km >= 20 km et < 30 km
   * - 2,50€ par passager >= 30 km
   * - limite d'incitation à 80 km -> non incités au dessus
   */
  protected slices: RunnableSlices = [
    { start: 2_000, end: 20_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 150) },
    {
      start: 20_000,
      end: 30_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10, offset: 20_000, limit: 30_000 })),
    },
    {
      start: 30_000,
      end: 80_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, 250),
    },
  ];

  protected processExclusions(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, getOperatorsAt(this.operators, ctx.carpool.datetime));
    isOperatorClassOrThrow(ctx, this.operator_class);
    startsOrEndsAtOrThrow(ctx, this.territorySelector);
    onDistanceRangeOrThrow(ctx, { min: 1_999, max: 80_000 });
  }

  processStateless(ctx: StatelessContextInterface): void {
    this.processExclusions(ctx);
    super.processStateless(ctx);

    // Apply each slice and sum up the results
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
