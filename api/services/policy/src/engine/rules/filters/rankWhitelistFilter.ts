import { ApplicableRuleInterface } from '../../../interfaces/RuleInterface';
import { HIGH } from '../../helpers/priority';
import { NotApplicableTargetException } from '../../../exceptions/NotApplicableTargetException';

type RankWhitelistParameters = string[];

export const rankWhitelistFilter: ApplicableRuleInterface = {
  slug: 'rank_whitelist_filter',
  description: 'Filtre par classe de preuve',
  schema: {
    type: 'array',
    items: {
      type: 'string',
      enum: ['A', 'B', 'C'],
    },
  },
  index: HIGH,
  apply(params: RankWhitelistParameters) {
    return async (ctx, next): Promise<void> => {
      if (params.indexOf(ctx.person.operator_class) < 0) {
        throw new NotApplicableTargetException(rankWhitelistFilter);
      }
      return next();
    };
  },
};
