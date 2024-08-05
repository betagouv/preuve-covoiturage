import { Timezone } from "@/pdc/providers/validator/types.ts";
import { NotEligibleTargetException } from "@/pdc/services/policy/engine/exceptions/NotEligibleTargetException.ts";
import {
  getOperatorsAt,
  TimestampedOperators,
} from "@/pdc/services/policy/engine/helpers/getOperatorsAt.ts";
import { endsAt } from "@/pdc/services/policy/engine/helpers/index.ts";
import { isAdultOrThrow } from "@/pdc/services/policy/engine/helpers/isAdultOrThrow.ts";
import { isOperatorClassOrThrow } from "@/pdc/services/policy/engine/helpers/isOperatorClassOrThrow.ts";
import { isOperatorOrThrow } from "@/pdc/services/policy/engine/helpers/isOperatorOrThrow.ts";
import {
  LimitTargetEnum,
  watchForGlobalMaxAmount,
  watchForPersonMaxAmountByMonth,
  watchForPersonMaxTripByDay,
} from "@/pdc/services/policy/engine/helpers/limits.ts";
import {
  onDistanceRange,
  onDistanceRangeOrThrow,
} from "@/pdc/services/policy/engine/helpers/onDistanceRange.ts";
import { perKm, perSeat } from "@/pdc/services/policy/engine/helpers/per.ts";
import { startsAt } from "@/pdc/services/policy/engine/helpers/position.ts";
import { AbstractPolicyHandler } from "@/pdc/services/policy/engine/policies/AbstractPolicyHandler.ts";
import { RunnableSlices } from "@/pdc/services/policy/interfaces/engine/PolicyInterface.ts";
import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from "@/pdc/services/policy/interfaces/index.ts";
import { description } from "./20240201_TerresTouloises.html.ts";

/* eslint-disable-next-line */
export const CCVMM202405: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface {
  static readonly id = "CCVMM_2024_05";
  static readonly tz: Timezone = "Europe/Paris";

  protected operators: TimestampedOperators = [
    {
      date: new Date("2024-05-13T00:00:00+0100"),
      operators: [OperatorsEnum.BLABLACAR_DAILY],
    },
  ];

  protected regularSlices: RunnableSlices = [
    {
      start: 2_000,
      end: 15_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, 150),
    },
    {
      start: 15_000,
      end: 30_000,
      fn: (ctx: StatelessContextInterface) =>
        perSeat(
          ctx,
          150 + perKm(ctx, { amount: 10, offset: 15_000, limit: 30_000 }),
        ),
    },
    {
      start: 30_000,
      end: 80_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, 300),
    },
  ];

  constructor(public policy_max_amount: number) {
    super();
    this.limits = [
      [
        "458F51C4-6DBE-4EA9-844F-BC2DCF37588B",
        this.policy_max_amount,
        watchForGlobalMaxAmount,
      ],
      [
        "6CDECFBD-9A98-4916-BDF1-B852213D2DE8",
        6,
        watchForPersonMaxTripByDay,
        LimitTargetEnum.Driver,
      ],
      [
        "E699C90B-9824-4FF5-97A0-F4B221C98140",
        120_00,
        watchForPersonMaxAmountByMonth,
        LimitTargetEnum.Driver,
      ],
    ];
  }

  protected processExclusion(
    ctx: StatelessContextInterface,
  ) {
    try {
      isOperatorOrThrow(
        ctx,
        getOperatorsAt(this.operators, ctx.carpool.datetime),
      );
      onDistanceRangeOrThrow(ctx, { min: 2_000, max: 80_000 });
      isOperatorClassOrThrow(ctx, ["B", "C"]);
      isAdultOrThrow(ctx);

      // Exclusion des trajets qui ne partent pas de la cc
      if (
        !startsAt(ctx, { epci: ["200066645"] }) &&
        !endsAt(ctx, { epci: ["200066645"] })
      ) {
        throw new NotEligibleTargetException("Not in scope");
      }
    } catch (e) {
      throw e;
    }
  }

  processStateless(ctx: StatelessContextInterface): void {
    this.processExclusion(ctx);
    super.processStateless(ctx);

    for (const { start, end, fn } of this.regularSlices) {
      if (onDistanceRange(ctx, { min: start, max: end })) {
        ctx.incentive.set(fn(ctx));
        break;
      }
    }
  }

  params(): PolicyHandlerParamsInterface {
    return {
      tz: CCVMM202405.tz,
      slices: this.regularSlices,
      operators: getOperatorsAt(this.operators),
      limits: {
        glob: this.policy_max_amount,
      },
    };
  }

  describe(): string {
    return description;
  }
};
