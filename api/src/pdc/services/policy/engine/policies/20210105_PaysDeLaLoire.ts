import { NotEligibleTargetException } from "@/pdc/services/policy/engine/exceptions/NotEligibleTargetException.ts";
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
import {
  endsAt,
  startsAndEndsAt,
  startsAt,
} from "@/pdc/services/policy/engine/helpers/position.ts";
import { description } from "@/pdc/services/policy/engine/policies/20210105_PaysDeLaLoire.html.ts";
import { AbstractPolicyHandler } from "@/pdc/services/policy/engine/policies/AbstractPolicyHandler.ts";
import { RunnableSlices } from "@/pdc/services/policy/interfaces/engine/PolicyInterface.ts";
import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from "@/pdc/services/policy/interfaces/index.ts";

// Politique de Pays de la Loire
export const PaysDeLaLoire2021: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface {
  static readonly id = "249";

  protected operators: TimestampedOperators = [
    {
      date: new Date("2021-01-05T00:00:00+0100"),
      operators: [
        OperatorsEnum.BLABLACAR_DAILY,
        OperatorsEnum.KAROS,
        OperatorsEnum.KLAXIT,
        OperatorsEnum.MOBICOOP,
      ],
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
      end: 50_000,
      fn: (ctx: StatelessContextInterface) =>
        perSeat(ctx, perKm(ctx, { amount: 10, offset: 20_000, limit: 50_000 })),
    },
  ];

  constructor(public max_amount: number) {
    super();
    this.limits = [
      [
        "8C5251E8-AB82-EB29-C87A-2BF59D4F6328",
        6,
        watchForPersonMaxTripByDay,
        LimitTargetEnum.Driver,
      ],
      [
        "5499304F-2C64-AB1A-7392-52FF88F5E78D",
        max_amount,
        watchForGlobalMaxAmount,
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

    // Exclure les trajets NM->NM, Angers->Angers, Le Mans->Le Mans
    if (
      startsAndEndsAt(ctx, { aom: ["244900015"] }) ||
      startsAndEndsAt(ctx, { aom: ["244400404"] }) ||
      startsAndEndsAt(ctx, { aom: ["247200132"] }) ||
      startsAndEndsAt(ctx, { aom: ["200071678"] })
    ) {
      throw new NotEligibleTargetException();
    }

    // Exclure les trajets qui ne sont pas dans l'aom
    if (!startsAt(ctx, { reg: ["52"] }) || !endsAt(ctx, { reg: ["52"] })) {
      throw new NotEligibleTargetException();
    }
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
