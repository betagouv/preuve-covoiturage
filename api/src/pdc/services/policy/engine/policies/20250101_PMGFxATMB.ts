import { getOperatorsAt, TimestampedOperators } from "@/pdc/services/policy/engine/helpers/getOperatorsAt.ts";
import { isOperatorClassOrThrow } from "@/pdc/services/policy/engine/helpers/isOperatorClassOrThrow.ts";
import { isOperatorOrThrow } from "@/pdc/services/policy/engine/helpers/isOperatorOrThrow.ts";
import {
  LimitTargetEnum,
  watchForGlobalMaxAmount,
  watchForPersonMaxAmountByMonth,
} from "@/pdc/services/policy/engine/helpers/limits.ts";
import { onDistanceRange, onDistanceRangeOrThrow } from "@/pdc/services/policy/engine/helpers/onDistanceRange.ts";
import { perKm, perSeat } from "@/pdc/services/policy/engine/helpers/per.ts";
import { startsAndEndsAt } from "@/pdc/services/policy/engine/helpers/position.ts";
import { startsOrEndsAtOrThrow } from "@/pdc/services/policy/engine/helpers/startsOrEndsAtOrThrow.ts";
import { AbstractPolicyHandler } from "@/pdc/services/policy/engine/policies/AbstractPolicyHandler.ts";
import { RunnableSlices } from "@/pdc/services/policy/interfaces/engine/PolicyInterface.ts";
import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
  TerritoryCodeEnum,
  TerritorySelectorsInterface,
} from "@/pdc/services/policy/interfaces/index.ts";
import { description } from "./20250101_PMGFxATMB.html.ts";

// INSERT INTO policy.policies (territory_id, start_date, end_date, name, unit, status, handler, max_amount)
// VALUES (
//   36102,
//   '2025-01-01T00:00:00+0200',
//   '2025-12-31T00:00:00+0100',
//   'PMGFxATMB 2025',
//   'euro',
//   'draft',
//   'pmgf_atmb_2025',
//   24244600
// );

export const PMGFxATMB2025: PolicyHandlerStaticInterface = class extends AbstractPolicyHandler
  implements PolicyHandlerInterface {
  static readonly id = "pmgf_atmb_2025";

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
        50_00,
        watchForPersonMaxAmountByMonth,
        LimitTargetEnum.Driver,
      ],
      [
        "cd6a2dd5-5e45-49fe-8618-09d3e8d9c679",
        this.max_amount,
        watchForGlobalMaxAmount,
      ], // required
    ];
  }

  /**
   * Trajets intra-AOM (origine ET destination dans l'AOM)
   * - 1,50€ par passager de 5 à 20 km
   * - 1,50€ par passager + 0,125€ pour les km > 20 km
   * - limite d'incitation à 40 km
   */
  protected internalTripsSlices: RunnableSlices = [
    {
      start: 5_000,
      end: 20_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, 150),
    },
    {
      start: 20_000,
      end: 150_000,
      fn: (ctx: StatelessContextInterface) =>
        perSeat(
          ctx,
          perKm(ctx, { amount: 12.5, offset: 20_000, limit: 40_000 }),
        ),
    },
  ];

  /**
   * Trajets extra-AOM (origine OU destination dans l'AOM)
   * - 0,50€ par passager de 5 à 20 km
   * - 0,50€ par passager + 0,125€ pour les km > 20 km
   * - limite d'incitation à 40 km
   */
  protected externalTripsSlices: RunnableSlices = [
    {
      start: 5_000,
      end: 20_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, 50),
    },
    {
      start: 20_000,
      end: 150_000,
      fn: (ctx: StatelessContextInterface) =>
        perSeat(
          ctx,
          perKm(ctx, { amount: 12.5, offset: 20_000, limit: 40_000 }),
        ),
    },
  ];

  protected territorySelector: TerritorySelectorsInterface = {
    [TerritoryCodeEnum.Mobility]: [
      "240100750", // CA du Pays de GEX
      "247400690", // CC du Genevois
      "200011773", // CC Annemasse-Les Voirons-Agglomération
      "200067551", // CA Thonon Agglomération
    ],
    [TerritoryCodeEnum.CityGroup]: [
      "240100891", // CA du Pays Bellegardien
      "247400724", // CC du Pays Rochois
      "200000172", // CC Faucigny-Glières
      "247400583", // CC Arve et Salève
    ],
  };

  protected getSlices(ctx?: StatelessContextInterface): RunnableSlices {
    if (!ctx) return this.internalTripsSlices;
    return startsAndEndsAt(ctx, this.territorySelector) ? this.internalTripsSlices : this.externalTripsSlices;
  }

  protected processExclusions(ctx: StatelessContextInterface) {
    isOperatorOrThrow(
      ctx,
      getOperatorsAt(this.operators, ctx.carpool.datetime),
    );
    isOperatorClassOrThrow(ctx, this.operator_class);
    startsOrEndsAtOrThrow(ctx, this.territorySelector);
    onDistanceRangeOrThrow(ctx, { min: 4_999, max: 150_000 });
  }

  override processStateless(ctx: StatelessContextInterface): void {
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
