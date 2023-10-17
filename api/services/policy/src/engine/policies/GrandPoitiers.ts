import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from '../../interfaces';
import { RunnableSlices } from '../../interfaces/engine/PolicyInterface';
import {
  LimitTargetEnum,
  isOperatorClassOrThrow,
  isOperatorOrThrow,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perSeat,
  watchForGlobalMaxAmount,
  watchForPersonMaxAmountByMonth,
  watchForPersonMaxTripByDay,
} from '../helpers';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';
import { description } from './GrandPoitiers.html';

// Politique Grands poitiers
export const GrandPoitiers: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface
{
  static readonly id = 'grand_poitier_2024';
  protected operators = [OperatorsEnum.Karos];
  protected operator_class = ['C'];

  constructor(public max_amount: number) {
    super();
    this.limits = [
      ['AFE1C47D-BF05-4FA9-9133-853D29797D09', 120_00, watchForPersonMaxAmountByMonth, LimitTargetEnum.Driver],
      ['69057f54-b8d7-410f-b390-f7fecbd1e5a5', 6, watchForPersonMaxTripByDay, LimitTargetEnum.Driver],
      ['qkx7a91u-wacc-1914-knwc-xwu1x1xx4wz4', 2, watchForPersonMaxTripByDay, LimitTargetEnum.Passenger],
      ['98B26189-C6FC-4DB1-AC1C-41F779C5B3C7', this.max_amount, watchForGlobalMaxAmount],
    ];
  }

  protected slices: RunnableSlices = [
    {
      start: 5_000,
      end: 79_999,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, 150),
    },
  ];

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, this.operators);
    onDistanceRangeOrThrow(ctx, { min: 4_999, max: 80_000 });
    isOperatorClassOrThrow(ctx, this.operator_class);
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
      slices: this.slices,
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
