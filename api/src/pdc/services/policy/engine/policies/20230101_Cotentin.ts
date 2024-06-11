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
import { description } from "./20230101_Cotentin.html.ts";

// Politique de la Communauté D'Agglomeration du Cotentin
export const Cotentin2023: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface {
  static readonly id = "cotentin_2023";

  constructor(public max_amount: number) {
    super();
    this.limits = [
      [
        "CDCC69D1-0E76-E109-F87D-1D3AD738EFB2",
        6,
        watchForPersonMaxTripByDay,
        LimitTargetEnum.Driver,
      ],
      [
        "9E35A0F7-AA0B-5D94-AA79-66F5F3677934",
        this.max_amount,
        watchForGlobalMaxAmount,
      ],
    ];
  }

  protected operators: TimestampedOperators = [
    {
      date: new Date("2023-01-01T00:00:00+0100"),
      operators: [OperatorsEnum.KLAXIT],
    },
    {
      date: new Date("2024-04-01T00:00:00+0200"),
      operators: [OperatorsEnum.BLABLACAR_DAILY],
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

  protected processExclusion(ctx: StatelessContextInterface) {
    onDistanceRangeOrThrow(ctx, { min: 2_000 });
    isOperatorOrThrow(
      ctx,
      getOperatorsAt(this.operators, ctx.carpool.datetime),
    );
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
        glob: this.max_amount,
      },
    };
  }

  describe(): string {
    return description;
  }
};
