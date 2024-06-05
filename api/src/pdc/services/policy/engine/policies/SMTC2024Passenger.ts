import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from '../../interfaces/index.ts';
import { RunnableSlices } from '../../interfaces/engine/PolicyInterface.ts';
import {
  LimitTargetEnum,
  isOperatorClassOrThrow,
  isOperatorOrThrow,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perKm,
  perSeat,
  watchForGlobalMaxAmount,
} from '../helpers/index.ts';
import { watchForPersonMaxTripByDay } from '../helpers/limits.ts';
import { AbstractPolicyHandler } from './AbstractPolicyHandler.ts';
import { description } from './SMTC2024Passenger.html.ts';

// Politique Syndicat Mixte des Transports en Commun de l’Agglomération Clermontoise (SMTC)
// aom = 256300120
export const SMTC2024Passenger: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface
{
  static readonly id = 'smtc_2024_passenger';
  protected operators = [OperatorsEnum.MOV_ICI];
  protected operator_class = ['B', 'C'];

  constructor(public max_amount: number) {
    super();
    this.limits = [
      ['be9c45cf-5e07-4c37-b8bf-59601e3607f7', 2, watchForPersonMaxTripByDay, LimitTargetEnum.Passenger],
      ['4a17073a-e8d7-40ba-bcc2-26d126b41ca4', this.max_amount, watchForGlobalMaxAmount],
    ];
  }

  protected slices: RunnableSlices = [
    {
      start: 5_000,
      end: 30_001,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10 })),
    },
  ];

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, this.operators);
    onDistanceRangeOrThrow(ctx, { min: 5_000, max: 30_001 });
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
