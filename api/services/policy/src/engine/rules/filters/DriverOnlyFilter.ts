import { RuleHandlerContextInterface } from '../../interfaces';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { FilterRule } from '../FilterRule';

export class DriverOnlyFilter extends FilterRule {
  static readonly slug: string = 'driver_only_filter';
  static readonly description: string = "La politique n'est applicable qu'aux conducteurs";

  async filter(ctx: RuleHandlerContextInterface): Promise<void> {
    if (!ctx.person.is_driver) {
      throw new NotApplicableTargetException(DriverOnlyFilter.description);
    }
  }
}
