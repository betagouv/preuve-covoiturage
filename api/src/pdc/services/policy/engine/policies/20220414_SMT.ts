import { ensureFreeRide } from "@/pdc/services/policy/engine/helpers/ensureFreeRide.ts";
import {
  getOperatorsAt,
  TimestampedOperators,
} from "@/pdc/services/policy/engine/helpers/getOperatorsAt.ts";
import { isOperatorClassOrThrow } from "@/pdc/services/policy/engine/helpers/isOperatorClassOrThrow.ts";
import { isOperatorOrThrow } from "@/pdc/services/policy/engine/helpers/isOperatorOrThrow.ts";
import {
  LimitTargetEnum,
  watchForGlobalMaxAmount,
  watchForPersonMaxTripByDay,
} from "@/pdc/services/policy/engine/helpers/limits.ts";
import {
  onDistanceRange,
  onDistanceRangeOrThrow,
} from "@/pdc/services/policy/engine/helpers/onDistanceRange.ts";
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
import { description } from "./20220414_SMT.html.ts";

// Politique du Syndicat des Mobilités de Touraine
export const SMT2022: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface {
  static readonly id = "713";

  protected operators: TimestampedOperators = [
    {
      date: new Date("2021-01-05T00:00:00+0100"),
      operators: [OperatorsEnum.KLAXIT],
    },
  ];

  protected slices: RunnableSlices = [
    {
      start: 2_000,
      end: 20_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, 200),
    },
    {
      start: 20_000,
      end: 40_000,
      fn: (ctx: StatelessContextInterface) =>
        perSeat(ctx, perKm(ctx, { amount: 10, offset: 20_000, limit: 40_000 })),
    },
  ];
  constructor(public max_amount: number) {
    super();
    this.limits = [
      [
        "A34719E4-DCA0-78E6-38E4-701631B106C2",
        6,
        watchForPersonMaxTripByDay,
        LimitTargetEnum.Driver,
      ],
      [
        "B15AD9E9-BF92-70FA-E8F1-B526D1BB6D4F",
        this.max_amount,
        watchForGlobalMaxAmount,
      ],
    ];
  }

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(
      ctx,
      getOperatorsAt(this.operators, ctx.carpool.datetime),
    );
    onDistanceRangeOrThrow(ctx, { min: 2_000, max: 150_000 });
    isOperatorClassOrThrow(ctx, ["B", "C"]);
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
      tz: "Europe/Paris",
      slices: this.slices,
      operators: getOperatorsAt(this.operators),
      limits: {
        glob: 40_000_00,
      },
    };
  }

  describe(): string {
    return description;
  }
};
