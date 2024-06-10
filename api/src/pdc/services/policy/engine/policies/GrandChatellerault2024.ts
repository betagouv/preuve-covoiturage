import { Timezone } from "@/pdc/providers/validator/index.ts";
import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from "../../interfaces/index.ts";
import {
  RunnableSlices,
  TestingLogFn,
} from "../../interfaces/engine/PolicyInterface.ts";
import { NotEligibleTargetException } from "../exceptions/NotEligibleTargetException.ts";
import {
  endsAt,
  isOperatorClassOrThrow,
  isOperatorOrThrow,
  LimitTargetEnum,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perSeat,
  startsAt,
  watchForGlobalMaxAmount,
  watchForPersonMaxAmountByMonth,
  watchForPersonMaxTripByDay,
} from "../helpers/index.ts";
import { isAdultOrThrow } from "../helpers/isAdultOrThrow.ts";
import { AbstractPolicyHandler } from "./AbstractPolicyHandler.ts";
import { description } from "./GrandChatellerault2024.html.ts";

// Politique de Pays de la Loire 2024
/* eslint-disable-next-line */
export const GrandChatellerault2024: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface {
  static readonly id = "grand_chatellerault_2024";
  static readonly tz: Timezone = "Europe/Paris";

  protected operators = [
    OperatorsEnum.BLABLACAR_DAILY,
    OperatorsEnum.KAROS,
    OperatorsEnum.KLAXIT,
    OperatorsEnum.MOBICOOP,
  ];

  protected regularSlices: RunnableSlices = [
    {
      start: 5_000,
      end: 80_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, 150),
    },
  ];

  constructor(public max_amount: number) {
    super();
    this.limits = [
      [
        "24338FBE-6E41-4C7D-B3FA-969EF0CB3789",
        this.max_amount,
        watchForGlobalMaxAmount,
      ],
      [
        "36089A82-4F5D-4AB0-809B-CDB1E41330D9",
        6,
        watchForPersonMaxTripByDay,
        LimitTargetEnum.Driver,
      ],
      [
        "456D6AC1-DCE9-403A-876E-91E3B2E80A80",
        2,
        watchForPersonMaxTripByDay,
        LimitTargetEnum.Passenger,
      ],
      [
        "71390F62-7377-427B-9F26-155F2225CDEF",
        120_00,
        watchForPersonMaxAmountByMonth,
        LimitTargetEnum.Driver,
      ],
    ];
  }

  protected processExclusion(
    ctx: StatelessContextInterface,
    log?: TestingLogFn,
  ) {
    isOperatorOrThrow(ctx, this.operators);
    onDistanceRangeOrThrow(ctx, { min: 5_000, max: 80_000 });
    isOperatorClassOrThrow(ctx, ["C"]);
    isAdultOrThrow(ctx);

    // Exclusion des OD hors de la zone de CA du Grand Châtellerault (248600413)
    if (
      !startsAt(ctx, { aom: ["248600413"] }) &&
      !endsAt(ctx, { aom: ["248600413"] })
    ) {
      throw new NotEligibleTargetException();
    }

    // Exclusion des OD des autres AOM
    const aomToExclude = [
      "200069854", // CU du Grand Poitiers (200069854)
    ];

    if (
      startsAt(ctx, { aom: aomToExclude }) || endsAt(ctx, { aom: aomToExclude })
    ) {
      throw new NotEligibleTargetException();
    }
  }

  processStateless(ctx: StatelessContextInterface, log?: TestingLogFn): void {
    this.processExclusion(ctx, log);
    super.processStateless(ctx);

    let amount = 0;
    for (const { start, fn } of this.regularSlices) {
      if (onDistanceRange(ctx, { min: start })) {
        amount += fn(ctx);
      }
    }

    ctx.incentive.set(amount);
  }

  params(): PolicyHandlerParamsInterface {
    return {
      tz: GrandChatellerault2024.tz,
      slices: this.regularSlices,
      operators: this.operators,
      limits: {
        glob: this.max_amount,
      },
    };
  }

  describe(): string {
    return description;
  }
};
