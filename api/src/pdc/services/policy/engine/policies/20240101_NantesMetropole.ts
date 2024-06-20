import { Timezone } from "@/pdc/providers/validator/types.ts";
import { NotEligibleTargetException } from "@/pdc/services/policy/engine/exceptions/NotEligibleTargetException.ts";
import {
  getOperatorsAt,
  TimestampedOperators,
} from "@/pdc/services/policy/engine/helpers/getOperatorsAt.ts";
import { isAdultOrThrow } from "@/pdc/services/policy/engine/helpers/isAdultOrThrow.ts";
import { isOperatorClassOrThrow } from "@/pdc/services/policy/engine/helpers/isOperatorClassOrThrow.ts";
import { isOperatorOrThrow } from "@/pdc/services/policy/engine/helpers/isOperatorOrThrow.ts";
import {
  LimitTargetEnum,
  watchForGlobalMaxAmount,
  watchForPersonMaxAmountByMonth,
  watchForPersonMaxAmountByYear,
  watchForPersonMaxTripByDay,
} from "@/pdc/services/policy/engine/helpers/limits.ts";
import {
  onDistanceRange,
  onDistanceRangeOrThrow,
} from "@/pdc/services/policy/engine/helpers/onDistanceRange.ts";
import { perKm, perSeat } from "@/pdc/services/policy/engine/helpers/per.ts";
import {
  endsAt,
  startsAt,
} from "@/pdc/services/policy/engine/helpers/position.ts";
import { AbstractPolicyHandler } from "@/pdc/services/policy/engine/policies/AbstractPolicyHandler.ts";
import { toTzString } from "@/pdc/services/policy/helpers/index.ts";
import { RunnableSlices } from "@/pdc/services/policy/interfaces/engine/PolicyInterface.ts";
import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from "@/pdc/services/policy/interfaces/index.ts";
import { description } from "./20240101_NantesMetropole.html.ts";

// Politique de Pays de la Loire 2024
/* eslint-disable-next-line */
export const NantesMetropole2024: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface {
  static readonly id = "nantes_metropole_2024";
  static readonly tz: Timezone = "Europe/Paris";

  public static mode<T>(date: Date, regular: T, booster: T): T {
    if (!NantesMetropole2024.boosterDates) return regular;
    const ymd = toTzString(date).slice(0, 10);
    return NantesMetropole2024.boosterDates.includes(ymd) ? booster : regular;
  }

  // Liste de dates au format YYYY-MM-DD dans la zone Europe/Paris
  // pour lesquelles les règles de booster s'appliquent
  protected boosterDates: string[] = [];

  protected operators: TimestampedOperators = [
    {
      date: new Date("2024-01-01T00:00:00+0100"),
      operators: [
        OperatorsEnum.BLABLACAR_DAILY,
        OperatorsEnum.KAROS,
        OperatorsEnum.KLAXIT,
        OperatorsEnum.MOBICOOP,
      ],
    },
  ];

  protected regularSlices: RunnableSlices = [
    {
      start: 5_000,
      end: 17_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, 75),
    },
    {
      start: 17_000,
      end: 60_000,
      fn: (ctx: StatelessContextInterface) => {
        // 0,10 euro par trajet par km par passager avec un maximum de 2,00 euros
        return perSeat(
          ctx,
          Math.min(
            perKm(ctx, { amount: 10, offset: 17_000, limit: 60_000 }),
            200 - 75,
          ),
        );
      },
    },
  ];

  protected boosterSlices: RunnableSlices = [
    {
      start: 5_000,
      end: 17_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, 165),
    },
    {
      start: 17_000,
      end: 60_000,
      fn: (ctx: StatelessContextInterface) => {
        // 0,10 euro par trajet par km par passager avec un maximum de 2,90 euros
        return perSeat(
          ctx,
          Math.min(
            perKm(ctx, { amount: 10, offset: 17_000, limit: 60_000 }),
            290 - 165,
          ),
        );
      },
    },
  ];

  constructor(public max_amount: number) {
    super();
    this.limits = [
      [
        "01A68CC8-DFEA-4DA9-8957-5BB702F17D89",
        this.max_amount,
        watchForGlobalMaxAmount,
      ],
      [
        "69A0BFF8-D6F3-4DC9-8159-27CC8115AF48",
        6,
        watchForPersonMaxTripByDay,
        LimitTargetEnum.Driver,
      ],
      [
        "CC5F5094-8431-4EA3-AC60-F51A75374356",
        84_00,
        watchForPersonMaxAmountByMonth,
        LimitTargetEnum.Driver,
      ],
      [
        "76004F3C-6999-47E6-B273-E9799DB3399F",
        1008_00,
        watchForPersonMaxAmountByYear,
        LimitTargetEnum.Driver,
      ],
    ];
  }

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(
      ctx,
      getOperatorsAt(this.operators, ctx.carpool.datetime),
    );
    onDistanceRangeOrThrow(ctx, { min: 5_000, max: 60_001 });
    isOperatorClassOrThrow(ctx, ["C"]);
    isAdultOrThrow(ctx);

    // Exclusion des OD des autres régions
    if (!startsAt(ctx, { reg: ["52"] }) || !endsAt(ctx, { reg: ["52"] })) {
      throw new NotEligibleTargetException();
    }

    // Exclusion des OD des autres AOM
    if (
      !startsAt(ctx, { aom: ["244400404"] }) ||
      !endsAt(ctx, { aom: ["244400404"] })
    ) {
      throw new NotEligibleTargetException();
    }
  }

  processStateless(ctx: StatelessContextInterface): void {
    this.processExclusion(ctx);
    super.processStateless(ctx);

    if (!NantesMetropole2024.mode) {
      throw new Error("NantesMetropole2024.mode is not defined");
    }

    let amount = 0;
    const slices = NantesMetropole2024.mode(
      ctx.carpool.datetime,
      this.regularSlices,
      this.boosterSlices,
    );
    for (const { start, fn } of slices) {
      if (onDistanceRange(ctx, { min: start })) {
        amount += fn(ctx);
      }
    }

    ctx.incentive.set(amount);
  }

  params(date?: Date): PolicyHandlerParamsInterface {
    if (!NantesMetropole2024.mode) {
      throw new Error("NantesMetropole2024.mode is not defined");
    }

    return {
      tz: NantesMetropole2024.tz,
      slices: date
        ? NantesMetropole2024.mode(date, this.regularSlices, this.boosterSlices)
        : this.regularSlices,
      booster_dates: this.boosterDates,
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
