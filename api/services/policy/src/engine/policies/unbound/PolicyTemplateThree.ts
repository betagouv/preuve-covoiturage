import {
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatelessContextInterface,
  TerritorySelectorsInterface,
} from '../../../interfaces';
import {
  ConfiguredLimitInterface,
  endsAt,
  isOperatorClassOrThrow,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perSeat,
  startsAt,
} from '../../helpers';
import { AbstractPolicyHandler } from '../AbstractPolicyHandler';
import { PolicyTemplateDescriptions } from '../../../shared/policy/common/classes/PolicyTemplateDescription';
import { NotEligibleTargetException } from '../../exceptions/NotEligibleTargetException';

export const PolicyTemplateThree: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface
{
  params(): PolicyHandlerParamsInterface {
    throw new Error('Method not implemented.');
  }
  describe(): string {
    return PolicyTemplateDescriptions.template_three_description_html;
  }

  static readonly id = '3';

  protected slices = [{ start: 2_000, end: 150_000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 50) }];

  processStateless(ctx: StatelessContextInterface): void {
    this.processExclusion(ctx);
    // Par kilomètre
    let amount = 0;
    for (const { start, fn } of this.slices) {
      if (onDistanceRange(ctx, { min: start })) {
        amount += fn(ctx);
      }
    }

    ctx.incentive.set(amount);
  }
  processExclusion(ctx: StatelessContextInterface) {
    isOperatorClassOrThrow(ctx, ['B', 'C']);
    onDistanceRangeOrThrow(ctx, { min: 2_000, max: 150_000 });

    // Exclure les trajets qui ne sont pas dans le selecteur géographique de la policy
    if (!startsAt(ctx, ctx.policy_territory_selector) || !endsAt(ctx, ctx.policy_territory_selector)) {
      throw new NotEligibleTargetException();
    }
  }

  protected limits: Array<ConfiguredLimitInterface> = [];
};
