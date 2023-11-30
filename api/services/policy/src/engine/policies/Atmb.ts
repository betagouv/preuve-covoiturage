import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
  TerritorySelectorsInterface,
} from '../../interfaces';
import { RunnableSlices } from '../../interfaces/engine/PolicyInterface';
import {
  isOperatorClassOrThrow,
  isOperatorOrThrow,
  LimitTargetEnum,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perKm,
  perSeat,
  watchForGlobalMaxAmount,
  watchForPersonMaxAmountByMonth,
} from '../helpers';
import { startAndEndAtOrThrow } from '../helpers/startAndEndAtOrThrow';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';
import { description } from './Atmb.html';

// Politique sur le réseau ATMB
// eslint-disable-next-line max-len
export const Atmb: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface
{
  static readonly id = 'atmb_2023';
  protected operators = [OperatorsEnum.BlaBlaDaily, OperatorsEnum.Karos, OperatorsEnum.Klaxit];
  protected operator_class = ['B', 'C'];

  constructor(public max_amount: number) {
    super();
    this.limits = [
      ['AFE1C47D-BF05-4FA9-9133-853D29797D09', 120_00, watchForPersonMaxAmountByMonth, LimitTargetEnum.Driver],
      ['98B26189-C6FC-4DB1-AC1C-41F779C5B3C7', this.max_amount, watchForGlobalMaxAmount],
    ];
  }

  protected selector: TerritorySelectorsInterface = {
    aom: ['200033116', '200023372', '247000623'],
    epci: ['200034882', '200034098', '247400047', '200070852'],
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
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10, offset: 20_000, limit: 40_000 })),
    },
  ];

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, this.operators);
    onDistanceRangeOrThrow(ctx, { min: 4_000 });
    isOperatorClassOrThrow(ctx, this.operator_class);
    startAndEndAtOrThrow(ctx, this.selector);
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
