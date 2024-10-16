import { NotEligibleTargetException } from "@/pdc/services/policy/engine/exceptions/NotEligibleTargetException.ts";
import {
  getOperatorsAt,
  TimestampedOperators,
} from "@/pdc/services/policy/engine/helpers/getOperatorsAt.ts";
import { isAfter } from "@/pdc/services/policy/engine/helpers/isAfter.ts";
import { isOperatorClassOrThrow } from "@/pdc/services/policy/engine/helpers/isOperatorClassOrThrow.ts";
import { isOperatorOrThrow } from "@/pdc/services/policy/engine/helpers/isOperatorOrThrow.ts";
import {
  LimitTargetEnum,
  watchForGlobalMaxAmount,
  watchForPersonMaxTripByDay,
} from "@/pdc/services/policy/engine/helpers/limits.ts";
import { onDistanceRangeOrThrow } from "@/pdc/services/policy/engine/helpers/onDistanceRange.ts";
import { onWeekday } from "@/pdc/services/policy/engine/helpers/onWeekday.ts";
import { startsAndEndsAtOrThrow } from "@/pdc/services/policy/engine/helpers/startsAndEndsAtOrThrow.ts";
import { AbstractPolicyHandler } from "@/pdc/services/policy/engine/policies/AbstractPolicyHandler.ts";
import {
  BoundedSlices,
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from "@/pdc/services/policy/interfaces/index.ts";
import { description } from "./20221024_Occitanie.html.ts";

function getContribution(ctx: StatelessContextInterface): number {
  return ctx.carpool.passenger_contribution || 0;
}

// Politique de la région Occitanie
export const Occitanie20232024: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface {
  static readonly id = "occitanie_2022";

  protected operators: TimestampedOperators = [
    {
      date: new Date("2021-01-05T00:00:00+0100"),
      operators: [
        OperatorsEnum.ATCHOUM,
        OperatorsEnum.BLABLACAR_DAILY,
        OperatorsEnum.KAROS,
        OperatorsEnum.KLAXIT,
        OperatorsEnum.MOBICOOP,
      ],
    },
  ];

  protected operator_class = ["B", "C"];
  protected slices: BoundedSlices = [
    { start: 0, end: 20_000 },
    { start: 20_000, end: 30_000 },
  ];

  constructor(public max_amount: number) {
    super();
    this.limits = [
      [
        "E8E1B5F5-64D5-48B9-8BBB-A64C33C500D8",
        6,
        watchForPersonMaxTripByDay,
        LimitTargetEnum.Driver,
      ],
      [
        "CB39AF21-5ED5-4792-AA81-1F19EACB901C",
        2,
        watchForPersonMaxTripByDay,
        LimitTargetEnum.Passenger,
      ],
      [
        "6D6D0BBA-09C1-40C4-B3C7-2EECF1C6A2A3",
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
    onDistanceRangeOrThrow(ctx, { max: 30_001 });
    isOperatorClassOrThrow(ctx, this.operator_class);
    // Pas le dimanche
    if (onWeekday(ctx, { days: [0] })) {
      throw new NotEligibleTargetException("Sunday is forbidden");
    }
    // Dans la région
    startsAndEndsAtOrThrow(ctx, { reg: ["76"] });

    // En excluant les trajets intra aom
    if (
      ctx.carpool.start.aom === ctx.carpool.end.aom &&
      ctx.carpool.start.aom != "200053791"
    ) {
      throw new NotEligibleTargetException("Journey start/end inside aom");
    }
    // La contribution passager ne doit pas être nulle
    if (isAfter(ctx, { date: new Date("2022-11-01") })) {
      if (getContribution(ctx) === 0) {
        throw new NotEligibleTargetException("Passager contribution is null");
      }
    }
  }

  processStateless(ctx: StatelessContextInterface): void {
    this.processExclusion(ctx);
    super.processStateless(ctx);

    const amount = Math.min(
      200,
      200 -
        getContribution(ctx) +
        Math.round(
            Math.max(0, Math.min(10_000, ctx.carpool.distance - 20_000)) /
              1_000,
          ) * 10,
    );

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
