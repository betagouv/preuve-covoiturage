import { getOperatorsAt, TimestampedOperators } from "@/pdc/services/policy/engine/helpers/getOperatorsAt.ts";
import { isBefore } from "@/pdc/services/policy/engine/helpers/isBefore.ts";
import { isOperatorClassOrThrow } from "@/pdc/services/policy/engine/helpers/isOperatorClassOrThrow.ts";
import { isOperatorOrThrow } from "@/pdc/services/policy/engine/helpers/isOperatorOrThrow.ts";
import {
  LimitTargetEnum,
  watchForGlobalMaxAmount,
  watchForPersonMaxAmountByMonth,
  watchForPersonMaxTripByDay,
} from "@/pdc/services/policy/engine/helpers/limits.ts";
import { onDistanceRange, onDistanceRangeOrThrow } from "@/pdc/services/policy/engine/helpers/onDistanceRange.ts";
import { perKm, perSeat } from "@/pdc/services/policy/engine/helpers/per.ts";
import { AbstractPolicyHandler } from "@/pdc/services/policy/engine/policies/AbstractPolicyHandler.ts";
import { RunnableSlices } from "@/pdc/services/policy/interfaces/engine/PolicyInterface.ts";
import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from "@/pdc/services/policy/interfaces/index.ts";
import { description } from "./20250101_Rennes.html.ts";

// INSERT INTO policy.policies (territory_id, start_date, end_date, name, unit, status, handler, max_amount)
// VALUES (
//   204,
//   '2025-01-01T00:00:00+0200',
//   '2027-12-31T00:00:00+0100',
//   'Rennes 2025',
//   'euro',
//   'draft',
//   'rennes_2025',
//   120950000
// );

export const Rennes2025: PolicyHandlerStaticInterface = class extends AbstractPolicyHandler
  implements PolicyHandlerInterface {
  static readonly id = "rennes_2025";

  protected operator_class = ["B", "C"];

  protected readonly operators: TimestampedOperators = [
    {
      date: new Date("2025-01-01T00:00:00+0200"),
      operators: [OperatorsEnum.BLABLACAR_DAILY],
    },
  ];

  constructor(public max_amount: number) {
    super();
    this.limits = [
      [
        "ddf5f99c-a40c-413c-bbea-927861cbb2f2",
        150_00,
        watchForPersonMaxAmountByMonth,
        LimitTargetEnum.Driver,
      ],
      [
        "8C5251E8-AB82-EB29-C87A-2BF59D4F6328",
        6,
        watchForPersonMaxTripByDay,
        LimitTargetEnum.Driver,
      ],
      [
        "cd6a2dd5-5e45-49fe-8618-09d3e8d9c679",
        this.max_amount,
        watchForGlobalMaxAmount,
      ],
    ];
  }

  /**
   * Trajets avant le 1 juillet (origine OU destination dans l'AOM)
   * - 0,50€ par passager de 5 à 60 km
   */
  protected beforeJulyTripsSlices: RunnableSlices = [
    {
      start: 5_000,
      end: 60_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, 50),
    },
  ];

  /**
   * Trajets après le 1er juillet (origine OU destination dans l'AOM)
   * - 1€ par passager de 5km à 15 km
   * - + 0,10€ du km par passager de 15 à 30 km
   * - 2.5€ par passager au dela de 30 km
   */
  protected afterJulyTripsSlices: RunnableSlices = [
    {
      start: 5_000,
      end: 15_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, 100),
    },
    {
      start: 15_000,
      end: 30_000,
      fn: (ctx: StatelessContextInterface) =>
        perSeat(
          ctx,
          perKm(ctx, { amount: 10, offset: 15_000, limit: 30_000 }),
        ),
    },
  ];

  private firstOfJulyDate: Date = new Date("2025-06-31T00:00:00+0200");

  protected getSlices(ctx?: StatelessContextInterface): RunnableSlices {
    if (!ctx) {
      return this.beforeJulyTripsSlices;
    }
    return isBefore(ctx, this.firstOfJulyDate) ? this.beforeJulyTripsSlices : this.afterJulyTripsSlices;
  }

  protected processExclusions(ctx: StatelessContextInterface) {
    isOperatorOrThrow(
      ctx,
      getOperatorsAt(this.operators, ctx.carpool.datetime),
    );
    isOperatorClassOrThrow(ctx, this.operator_class);
    onDistanceRangeOrThrow(ctx, { min: 4_999, max: 60_001 });
  }

  processStateless(ctx: StatelessContextInterface): void {
    this.processExclusions(ctx);
    super.processStateless(ctx);

    // Apply each slice and sum up the results
    let amount = 0;
    for (const { start, fn } of this.getSlices(ctx)) {
      if (onDistanceRange(ctx, { min: start })) {
        amount += fn(ctx);
      }
    }

    ctx.incentive.set(amount);
  }

  params(): PolicyHandlerParamsInterface {
    return {
      tz: "Europe/Paris",
      slices: this.getSlices(),
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
