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
import { description } from "./20230101_LaRochelle.html.ts";

export const LaRochelle2024: PolicyHandlerStaticInterface = class extends AbstractPolicyHandler
  implements PolicyHandlerInterface {
  static readonly id = "larochelle_2024";

  protected operators: TimestampedOperators = [
    {
      date: new Date("2024-01-01T00:00:00+0100"),
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
        "99911EAF-89AB-C346-DDD5-BD2C7704F935",
        max_amount,
        watchForGlobalMaxAmount,
      ],
      [
        "70CE7566-6FD5-F850-C039-D76AF6F8CEB5",
        6,
        watchForPersonMaxTripByDay,
        LimitTargetEnum.Driver,
      ],
      [
        "ECDE3CD4-96FF-C9D2-BA88-45754205A798",
        80_00,
        watchForPersonMaxAmountByMonth,
        LimitTargetEnum.Driver,
      ],
    ];
  }

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(
      ctx,
      getOperatorsAt(this.operators, ctx.carpool.datetime),
    );

    onDistanceRangeOrThrow(ctx, { min: 2_000 });
    isOperatorClassOrThrow(ctx, ["B", "C"]);
  }

  processStateless(ctx: StatelessContextInterface): void {
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

  params(): PolicyHandlerParamsInterface {
    return {
      tz: "Europe/Paris",
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
