import { RuleHandlerContextInterface } from '../../interfaces';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { FilterRule } from '../FilterRule';

export class PassengerOnlyFilter extends FilterRule {
  static readonly slug: string = 'passenger_only_filter';
  static readonly description: string = "La politique n'est applicable qu'aux passagers";

  filter(ctx: RuleHandlerContextInterface): void {
    if (ctx.person.is_driver) {
      throw new NotApplicableTargetException(PassengerOnlyFilter.description);
    }
  }
}
