import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from '../../interfaces';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import {
  isOperatorClassOrThrow,
  isOperatorOrThrow,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perKm,
  perSeat,
  startsAndEndsAt,
} from '../helpers';
import { ConfiguredLimitInterface } from '../helpers/limits';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';
import { description } from './MetropoleSavoie.html';

/* eslint-disable-next-line */
export const MetropoleSavoie: PolicyHandlerStaticInterface = class extends AbstractPolicyHandler implements PolicyHandlerInterface {
  static readonly id = 'metropole_savoie_2022';
  protected operators = [OperatorsEnum.BlaBlaDaily];
  protected slices = [
    { start: 5_000, end: 20_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 200) },
    {
      start: 20_000,
      end: 1_000_000,
      fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10, offset: 20_000 })),
    },
  ];

  policy_max_amount: number;
  constructor(policy_max_amount: number) {
    super();
    this.policy_max_amount = policy_max_amount;
    this.limits = [];
  }

  protected limits: Array<ConfiguredLimitInterface> = [];

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, this.operators);
    onDistanceRangeOrThrow(ctx, { min: 5_000 });
    isOperatorClassOrThrow(ctx, ['B', 'C']);
  }

  processStateless(ctx: StatelessContextInterface): void {
    this.processExclusion(ctx);
    super.processStateless(ctx);

    // Départ et arrivée dans l'aom
    if (!startsAndEndsAt(ctx, { aom: ['200068674', '200069110'], epci: ['200041010'] })) {
      throw new NotEligibleTargetException('Journey start & end not in region');
    }

    // Calcul des incitations par tranche
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
        glob: this.policy_max_amount,
      },
    };
  }

  describe(): string {
    return description;
  }
};
