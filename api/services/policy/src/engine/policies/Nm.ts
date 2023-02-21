import { RunnableSlices } from '../../interfaces/engine/PolicyInterface';
import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from '../../interfaces';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import {
  endsAt,
  isOperatorClassOrThrow,
  isOperatorOrThrow,
  LimitTargetEnum,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perKm,
  perSeat,
  startsAt,
  watchForGlobalMaxAmount,
  watchForGlobalMaxTrip,
  watchForPassengerMaxByTripByDay,
  watchForPersonMaxTripByDay,
} from '../helpers';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';
import { description } from './Nm.html';

// Politique de Nantes Métropole
export const Nm: PolicyHandlerStaticInterface = class extends AbstractPolicyHandler implements PolicyHandlerInterface {
  static readonly id = '656';
  protected operators = [OperatorsEnum.Klaxit];
  protected operatorClass = ['C'];
  protected slices: RunnableSlices = [
    { start: 2_000, end: 20_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 200) },
    { start: 20_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10 })) },
  ];

  constructor(public max_amount: number) {
    super();
    this.limits = [
      ['D5FA9FA9-E8CC-478E-80ED-96FDC5476689', 3, watchForPassengerMaxByTripByDay],
      ['6456EC1D-2183-71DC-B08E-0B8FC30E4A4E', 4, watchForPersonMaxTripByDay, LimitTargetEnum.Passenger],
      ['286AAF87-5CDB-A7C0-A599-FBE7FB6C5442', 4, watchForPersonMaxTripByDay, LimitTargetEnum.Driver],
      ['D1FED21B-5160-A1BF-C052-5DA7A190996C', 10_000_000, watchForGlobalMaxTrip],
      ['69FD0093-CEEE-0709-BB80-878D2E857630', max_amount, watchForGlobalMaxAmount],
    ];
  }

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, this.operators);
    onDistanceRangeOrThrow(ctx, { min: 2_000 });
    isOperatorClassOrThrow(ctx, this.operatorClass);

    // Exclure les trajets qui ne sont pas dans l'aom NM
    if (!startsAt(ctx, { aom: ['244400404'] }) || !endsAt(ctx, { aom: ['244400404'] })) {
      throw new NotEligibleTargetException();
    }
  }

  processStateless(ctx: StatelessContextInterface): void {
    this.processExclusion(ctx);
    super.processStateless(ctx);

    // Par kilomètre
    let amount = 0;
    for (const { start, end, fn } of this.slices) {
      if (onDistanceRange(ctx, { min: start, max: end })) {
        amount = fn(ctx);
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
