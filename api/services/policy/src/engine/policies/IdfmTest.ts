import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import {
  PolicyHandlerInterface,
  StatefulContextInterface,
  StatelessContextInterface,
  StepInterface,
} from '../interfaces';
import {
  atDate,
  isAfter,
  isDriverOrThrow,
  isOperatorClassOrThrow,
  isOperatorOrThrow,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perKm,
  perSeat,
  endsAt,
  startsAt,
  setMax,
  watchForGlobalMaxAmount,
  watchForPersonMaxAmountByMonth,
  watchForPersonMaxTripByDay,
} from '../helpers';

export class IdfmTest implements PolicyHandlerInterface<StepInterface> {
  protected operators = ['siret de klaxit', 'siret de karos'];
  protected limits = [
    setMax('99911EAF-89AB-C346-DDD5-BD2C7704F935', 600000000, watchForGlobalMaxAmount),
    setMax('56042464-852C-95B8-2009-8DD4808C9370', 6, watchForPersonMaxTripByDay),
    setMax('ECDE3CD4-96FF-C9D2-BA88-45754205A798', 15000, watchForPersonMaxAmountByMonth),
  ];

  processStateless(ctx: StatelessContextInterface): void {
    isDriverOrThrow(ctx);
    isOperatorClassOrThrow(ctx, ['B', 'C']);
    if (isAfter(ctx, { date: new Date('2022-09-01') })) {
      isOperatorClassOrThrow(ctx, ['C']);
    }
    isOperatorOrThrow(ctx, this.operators);
    onDistanceRangeOrThrow(ctx, { min: 2000, max: 150000 });
    if (startsAt(ctx, { com: ['75056'] }) && endsAt(ctx, { com: ['75056'] })) {
      throw new NotEligibleTargetException();
    }
    if (!startsAt(ctx, { aom: ['217500016'] }) || !endsAt(ctx, { aom: ['217500016'] })) {
      throw new NotEligibleTargetException();
    }

    for (const limit of this.limits) {
      const [staless] = limit;
      staless(ctx);
    }

    let amount = 0;
    if (onDistanceRange(ctx, { min: 2000, max: 15000 })) {
      amount = perSeat(ctx, 150);
    } else if (onDistanceRange(ctx, { min: 15000, max: 30000 })) {
      amount = perSeat(ctx, perKm(ctx, { amount: 10 }));
    }
    if (
      atDate(ctx, {
        dates: ['2022-02-18', '2022-03-25', '2022-03-26', '2022-03-27', '2022-03-28', '2022-06-18', '2022-07-06'],
      })
    ) {
      (amount *= 1), 5;
    }
    ctx.incentive.set(amount);
  }

  processStateful(ctx: StatefulContextInterface): void {
    for (const limit of this.limits) {
      const [, stateful] = limit;
      stateful(ctx);
    }
  }

  describe(): Array<StepInterface> {
    return [];
  }

  describeForHuman(): string {
    return 'Ceci est une super campagne';
  }
}
