import { RunnableSlices } from "../../interfaces/engine/PolicyInterface.ts";
import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from "../../interfaces/index.ts";
import {
  isAdultOrThrow,
  isOperatorClassOrThrow,
  isOperatorOrThrow,
  LimitTargetEnum,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perKm,
  perSeat,
  watchForGlobalMaxAmount,
  watchForPersonMaxAmountByMonth,
  watchForPersonMaxTripByDay,
} from "../helpers/index.ts";
import { AbstractPolicyHandler } from "./AbstractPolicyHandler.ts";
import { description } from "./PaysBasque20232024.html.ts";

// Pays Basque Adour
export const PaysBasque20232024: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface {
  static readonly id = "pays_basque_2023";
  protected operators = [
    OperatorsEnum.KLAXIT,
    OperatorsEnum.MOBICOOP,
    OperatorsEnum.BLABLACAR_DAILY,
    OperatorsEnum.KAROS,
  ];
  protected operators_for_2024 = [
    OperatorsEnum.KLAXIT,
    OperatorsEnum.BLABLACAR_DAILY,
    OperatorsEnum.KAROS,
  ];
  protected slices: RunnableSlices = [
    {
      start: 5_000,
      end: 20_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, 200),
    },
    {
      start: 20_000,
      end: 30_000,
      fn: (ctx: StatelessContextInterface) =>
        perSeat(ctx, perKm(ctx, { amount: 10, offset: 20_000, limit: 30_000 })),
    },
  ];

  private readonly LAST_DAY_OF_YEAR_DATE = new Date("2023-12-31");

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
        "ECDE3CD4-96FF-C9D2-BA88-45754205A798",
        150_00,
        watchForPersonMaxAmountByMonth,
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
      this.isAfter2023(ctx) ? this.operators_for_2024 : this.operators,
    );
    onDistanceRangeOrThrow(ctx, {
      min: 5_000,
      max: this.isAfter2023(ctx) ? 80_000 : 100_000,
    });
    isOperatorClassOrThrow(ctx, ["C"]);
    isAdultOrThrow(ctx);
  }

  private isAfter2023(ctx: StatelessContextInterface) {
    return ctx.carpool.datetime > this.LAST_DAY_OF_YEAR_DATE;
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
      operators: this.operators_for_2024,
      limits: {
        glob: this.max_amount,
      },
    };
  }

  describe(): string {
    return description;
  }
};
