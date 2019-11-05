import { ApplicableRuleInterface } from '../../interfaces/RuleInterfaces';
import { HIGH } from '../helpers/priority';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';

type OperatorWhitelistParameters = string[];

export const operatorWhitelistFilter: ApplicableRuleInterface = {
  slug: 'operator_whitelist_filter',
  description: 'Filtre par opérateur',
  schema: {
    type: 'array',
    items: {
      macro: 'dbid',
    },
  },
  index: HIGH,
  apply(params: OperatorWhitelistParameters) {
    return async (ctx, next) => {
      if (params.indexOf(ctx.person.operator_id) < 0) {
        throw new NotApplicableTargetException(operatorWhitelistFilter);
      }
      return next();
    };
  },
};
