import { ApplicableRuleInterface } from '../../../interfaces/RuleInterface';
import { HIGH } from '../../helpers/priority';
import { NotApplicableTargetException } from '../../../exceptions/NotApplicableTargetException';

type OperatorWhitelistParameters = number[];

export const operatorWhitelistFilter: ApplicableRuleInterface = {
  slug: 'operator_whitelist_filter',
  description: 'Filtre par opérateur',
  schema: {
    type: 'array',
    items: { macro: 'serial' },
  },
  index: HIGH,
  apply(params: OperatorWhitelistParameters) {
    return async (ctx, next): Promise<void> => {
      if (params.indexOf(ctx.person.operator_id) < 0) {
        throw new NotApplicableTargetException(operatorWhitelistFilter);
      }
      return next();
    };
  },
};
