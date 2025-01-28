import { getOperatorsAt, TimestampedOperators } from "@/pdc/services/policy/engine/helpers/getOperatorsAt.ts";
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
import { description } from "./20240101_LaRochelle.html.ts";

export const LaRochelle2025: PolicyHandlerStaticInterface = class extends AbstractPolicyHandler
  implements PolicyHandlerInterface {
  static readonly id = "la_rochelle_2025";

  protected operators: TimestampedOperators = [
    {
      date: new Date("2025-01-01T00:00:00+0100"),
      operators: [OperatorsEnum.BLABLACAR_DAILY],
    },
  ];

  protected slices: RunnableSlices = [
    {
      start: 5_000,
      end: 10_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, 100),
    },
    {
      start: 10_000,
      end: 20_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10, offset: 10_000, limit: 20_000 })),
    },
    {
      start: 20_000,
      fn: () => 0,
    },
  ];

  constructor(public max_amount: number) {
    super();
    this.limits = [
      [
        "016278ed-3f67-4f7b-983d-57d8d23094e0",
        max_amount,
        watchForGlobalMaxAmount,
      ],
      [
        "81dd369e-b6c0-4181-84b7-8ef21fa17aaf",
        6,
        watchForPersonMaxTripByDay,
        LimitTargetEnum.Driver,
      ],
      [
        "d0372337-2a3e-4148-b70a-c27331e71c23",
        80_00,
        watchForPersonMaxAmountByMonth,
        LimitTargetEnum.Driver,
      ],
    ];
  }

  public processStateless(ctx: StatelessContextInterface): void {
    this.processExclusion(ctx);
    super.processStateless(ctx);

    // Calcul des incitations par tranche
    let amount = 0;
    for (
      const { start, fn } of this.slices
    ) {
      if (onDistanceRange(ctx, { min: start })) {
        amount += fn(ctx);
      }
    }

    ctx.incentive.set(amount);
  }

  public params(): PolicyHandlerParamsInterface {
    return {
      tz: "Europe/Paris",
      slices: this.slices,
      operators: getOperatorsAt(this.operators),
      limits: {
        glob: this.max_amount,
      },
    };
  }

  public describe(): string {
    return description;
  }

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, getOperatorsAt(this.operators, ctx.carpool.datetime));
    onDistanceRangeOrThrow(ctx, { min: 5_000 });
    isOperatorClassOrThrow(ctx, ["B", "C"]);
  }
};
