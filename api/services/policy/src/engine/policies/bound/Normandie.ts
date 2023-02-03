import {
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
} from '../../../interfaces';
import { NotEligibleTargetException } from '../../exceptions/NotEligibleTargetException';
import {
  ConfiguredLimitInterface,
  isOperatorClassOrThrow,
  LimitTargetEnum,
  onDistanceRangeOrThrow,
  startsAndEndsAt,
  watchForGlobalMaxAmount,
  watchForPersonMaxTripByDay,
} from '../../helpers';
import { AbstractPolicyHandler } from '../../AbstractPolicyHandler';
import { description } from './Normandie.html';

// Politique de la région Normandie
export const Normandie: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface
{
  static readonly id = 'normandie_2023';
  protected operator_class = ['C'];
  private readonly MAX_GLOBAL_AMOUNT_LIMIT = 70_000_00;
  private readonly EPCI_WITHOUT_MOBILITY_COMPETENCE = ['200069516', '200066801', '241400878', '200071652'];

  protected limits: Array<ConfiguredLimitInterface> = [
    ['E8E1B5F5-64D5-48B9-8BBB-A64C33C500D8', 6, watchForPersonMaxTripByDay, LimitTargetEnum.Driver],
    ['CB39AF21-5ED5-4792-AA81-1F19EACB901C', 2, watchForPersonMaxTripByDay, LimitTargetEnum.Passenger],
    ['6D6D0BBA-09C1-40C4-B3C7-2EECF1C6A2A3', this.MAX_GLOBAL_AMOUNT_LIMIT, watchForGlobalMaxAmount],
  ];

  protected processExclusion(ctx: StatelessContextInterface) {
    onDistanceRangeOrThrow(ctx, { min: 5_000 });
    isOperatorClassOrThrow(ctx, this.operator_class);

    // Dans la région
    if (!startsAndEndsAt(ctx, { reg: ['28'] })) {
      throw new NotEligibleTargetException('Journey start & end not in region');
    }

    // En excluant les trajets intra aom excepté les epci n'ayant pas la compétence mobilité
    if (
      ctx.carpool.start.epci === ctx.carpool.end.epci &&
      !this.EPCI_WITHOUT_MOBILITY_COMPETENCE.includes(ctx.carpool.start.epci)
    ) {
      throw new NotEligibleTargetException('Journey start/end inside aom');
    }
  }

  processStateless(ctx: StatelessContextInterface): void {
    this.processExclusion(ctx);
    super.processStateless(ctx);
    ctx.incentive.set(100);
  }

  params(): PolicyHandlerParamsInterface {
    return {
      limits: {
        glob: this.MAX_GLOBAL_AMOUNT_LIMIT,
      },
    };
  }

  describe(): string {
    return description;
  }
};
