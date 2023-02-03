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
  onDistanceRangeOrThrow,
  watchForGlobalMaxAmount,
  LimitTargetEnum,
  startsAndEndsAt,
  ConfiguredLimitInterface,
  watchForPersonMaxTripByDay,
  onWeekday,
  isAfter,
  isOperatorOrThrow,
} from '../helpers';
import { AbstractPolicyHandler } from '../AbstractPolicyHandler';
import { description } from './Occitanie.html';

function getContribution(ctx: StatelessContextInterface): number {
  return ctx.carpool.passenger_payment || 0;
}

// Politique de la région Occitanie
export const Occitanie: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface
{
  static readonly id = 'occitanie_2022';
  protected operators = [
    OperatorsEnum.Atchoum,
    OperatorsEnum.BlaBlaDaily,
    OperatorsEnum.Karos,
    OperatorsEnum.Klaxit,
    OperatorsEnum.Mobicoop,
  ];
  protected operator_class = ['B', 'C'];
  private readonly MAX_GLOBAL_AMOUNT_LIMIT = 70_000_00;
  protected slices = [
    { start: 0, end: 10_000 },
    { start: 10_000, end: 30_000 },
  ];

  protected limits: Array<ConfiguredLimitInterface> = [
    ['E8E1B5F5-64D5-48B9-8BBB-A64C33C500D8', 6, watchForPersonMaxTripByDay, LimitTargetEnum.Driver],
    ['CB39AF21-5ED5-4792-AA81-1F19EACB901C', 2, watchForPersonMaxTripByDay, LimitTargetEnum.Passenger],
    ['6D6D0BBA-09C1-40C4-B3C7-2EECF1C6A2A3', this.MAX_GLOBAL_AMOUNT_LIMIT, watchForGlobalMaxAmount],
  ];

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, this.operators);
    onDistanceRangeOrThrow(ctx, { max: 30_000 });
    isOperatorClassOrThrow(ctx, this.operator_class);
    // Pas le dimanche
    if (onWeekday(ctx, { days: [0] })) {
      throw new NotEligibleTargetException('Sunday is forbidden');
    }
    // Dans la région
    if (!startsAndEndsAt(ctx, { reg: ['76'] })) {
      throw new NotEligibleTargetException('Journey start & end not in region');
    }
    // En excluant les trajets intra aom
    if (ctx.carpool.start.aom === ctx.carpool.end.aom && ctx.carpool.start.aom != '200053791') {
      throw new NotEligibleTargetException('Journey start/end inside aom');
    }
    // La contribution passager ne doit pas être nulle
    if (isAfter(ctx, { date: new Date('2022-11-01') })) {
      if (getContribution(ctx) === 0) {
        throw new NotEligibleTargetException('Passager contribution is null');
      }
    }
  }

  processStateless(ctx: StatelessContextInterface): void {
    this.processExclusion(ctx);
    super.processStateless(ctx);

    const amount = Math.min(
      200,
      200 -
        getContribution(ctx) +
        Math.round(Math.max(0, Math.min(10_000, ctx.carpool.distance - 20_000)) / 1_000) * 10,
    );

    ctx.incentive.set(amount);
  }

  params(): PolicyHandlerParamsInterface {
    return {
      slices: this.slices,
      operators: this.operators,
      limits: {
        glob: this.MAX_GLOBAL_AMOUNT_LIMIT,
      },
    };
  }

  describe(): string {
    return description;
  }
};
