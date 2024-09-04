import {
  getOperatorsAt,
  TimestampedOperators,
} from "@/pdc/services/policy/engine/helpers/getOperatorsAt.ts";
import { isOperatorClassOrThrow } from "@/pdc/services/policy/engine/helpers/isOperatorClassOrThrow.ts";
import { isOperatorOrThrow } from "@/pdc/services/policy/engine/helpers/isOperatorOrThrow.ts";
import {
  LimitTargetEnum,
  watchForGlobalMaxAmount,
  watchForPersonMaxAmountByMonth,
} from "@/pdc/services/policy/engine/helpers/limits.ts";
import {
  onDistanceRange,
  onDistanceRangeOrThrow,
} from "@/pdc/services/policy/engine/helpers/onDistanceRange.ts";
import { perKm, perSeat } from "@/pdc/services/policy/engine/helpers/per.ts";
import { startsAndEndsAtOrThrow } from "@/pdc/services/policy/engine/helpers/startsAndEndsAtOrThrow.ts";
import { AbstractPolicyHandler } from "@/pdc/services/policy/engine/policies/AbstractPolicyHandler.ts";
import { RunnableSlices } from "@/pdc/services/policy/interfaces/engine/PolicyInterface.ts";
import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
  TerritorySelectorsInterface,
} from "@/pdc/services/policy/interfaces/index.ts";
import { description } from "./20230502_ATMB.html.ts";

// Politique sur le réseau ATMB
// eslint-disable-next-line max-len
export const ATMB202305: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface {
  static readonly id = "atmb_2023";

  protected operators: TimestampedOperators = [
    {
      date: new Date("2023-05-02T00:00:00+0200"),
      operators: [
        OperatorsEnum.BLABLACAR_DAILY,
        OperatorsEnum.KAROS,
        OperatorsEnum.KLAXIT,
      ],
    },
  ];

  protected readonly operator_class = ["B", "C"];
  protected readonly policy_change_date = new Date("2023-12-18");

  constructor(public max_amount: number) {
    super();
    this.limits = [
      [
        "AFE1C47D-BF05-4FA9-9133-853D29797D09",
        50_00,
        watchForPersonMaxAmountByMonth,
        LimitTargetEnum.Driver,
      ], /** /!\ Only apply after first of december 2023 /!\ **/
      [
        "98B26189-C6FC-4DB1-AC1C-41F779C5B3C7",
        this.max_amount,
        watchForGlobalMaxAmount,
      ],
    ];
  }

  protected selector: TerritorySelectorsInterface = {
    aom: ["200033116", "200023372", "247000623"],
    epci: ["200034882", "200034098", "247400047", "200070852"],
  };

  protected new_selector: TerritorySelectorsInterface = {
    aom: ["200033116", "200023372"],
    epci: ["200034882", "200034098"],
  };

  protected slices: RunnableSlices = [
    {
      start: 4_000,
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
    isOperatorOrThrow(
      ctx,
      getOperatorsAt(this.operators, ctx.carpool.datetime),
    );
    onDistanceRangeOrThrow(ctx, { min: 4_000 });
    isOperatorClassOrThrow(ctx, this.operator_class);
    startsAndEndsAtOrThrow(
      ctx,
      ctx.carpool.datetime >= this.policy_change_date
        ? this.new_selector
        : this.selector,
    );
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
