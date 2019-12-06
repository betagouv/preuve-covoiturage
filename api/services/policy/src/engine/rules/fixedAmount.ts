import { ApplicableRuleInterface } from '../../interfaces/RuleInterface';
import { LOW } from '../helpers/priority';

export const fixedAmount: ApplicableRuleInterface = {
  slug: 'fixed_amount',
  description: 'Montant fixe',
  schema: {
    type: 'integer',
    minimum: 0,
  },
  index: LOW,
  apply(params: number) {
    return async (ctx, next) => {
      ctx.result = params;
      return next();
    };
  },
};
