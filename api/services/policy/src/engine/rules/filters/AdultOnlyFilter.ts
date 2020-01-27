import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { RuleHandlerContextInterface } from '../../interfaces';
import { FilterRule } from '../FilterRule';

export class AdultOnlyFilter extends FilterRule {
  static readonly slug = 'adult_only_filter';
  static readonly description = "La politique n'est applicable qu'aux personnes majeures";

  async filter(ctx: RuleHandlerContextInterface): Promise<void> {
    if (ctx.person.is_over_18 !== null && !ctx.person.is_over_18) {
      throw new NotApplicableTargetException(AdultOnlyFilter.description);
    }
  }
}
