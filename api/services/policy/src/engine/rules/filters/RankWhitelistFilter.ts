import { RuleHandlerContextInterface } from '../../interfaces';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { FilterRule } from '../FilterRule';

export class RankWhitelistFilter extends FilterRule<string[]> {
  static readonly slug: string = 'rank_whitelist_filter';
  static readonly description: string = 'Filtre par classe de preuve';
  static readonly schema: { [k:string]: any } = {
    type: 'array',
    items: {
      type: 'string',
      enum: ['A', 'B', 'C'],
    },
  };

  async filter(ctx: RuleHandlerContextInterface): Promise<void> {
    if (this.parameters.indexOf(ctx.person.operator_class) < 0) {
      throw new NotApplicableTargetException(RankWhitelistFilter.description);
    }
  }
}
