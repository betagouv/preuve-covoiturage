import { RuleHandlerContextInterface } from '../../interfaces';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { FilterRule } from '../FilterRule';

export class OperatorWhitelistFilter extends FilterRule<number[]> {
  static readonly slug: string = 'operator_whitelist_filter';
  static readonly description: string = 'Filtre par opérateur';
  static readonly schema: { [k: string]: any } = {
    type: 'array',
    items: { macro: 'serial' },
  };

  filter(ctx: RuleHandlerContextInterface): void {
    if (this.parameters.indexOf(ctx.person.operator_id) < 0) {
      throw new NotApplicableTargetException(OperatorWhitelistFilter.description);
    }
  }
}
