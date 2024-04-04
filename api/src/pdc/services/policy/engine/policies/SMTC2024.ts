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
} from '../helpers';
import { watchForPersonMaxAmountByYear, watchForPersonMaxTripByDay } from '../helpers/limits';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';
import { description } from './SMTC2024.html';

// Politique Syndicat Mixte des Transports en Commun de l’Agglomération Clermontoise (SMTC)
export const SMTC2024: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface
{
  static readonly id = 'smtc_2024';
  protected operators = [OperatorsEnum.MOV_ICI];
  protected operator_class = ['B', 'C'];

  constructor(public max_amount: number) {
    super();
    this.limits = [
      ['AFE1C47D-BF05-4FA9-9133-853D29797D09', 90_00, watchForPersonMaxAmountByMonth, LimitTargetEnum.Driver],
      ['AFE1C47D-BF05-4FA9-9133-853D2987GF56', 540_00, watchForPersonMaxAmountByYear, LimitTargetEnum.Driver],
      ['AFE1C47D-BF05-4FA9-9133-853D297AZEPD', 4, watchForPersonMaxTripByDay, LimitTargetEnum.Driver],
      ['98B26189-C6FC-4DB1-AC1C-41F779C5B3C7', this.max_amount, watchForGlobalMaxAmount],
    ];
  }

  protected slices: RunnableSlices = [
    {
      start: 5_000,
      end: 80_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, 150),
    },
  ];

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, this.operators);
    onDistanceRangeOrThrow(ctx, { min: 5_000, max: 80_000 });
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
      tz: 'Europe/Paris',
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
