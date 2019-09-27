import { ApplicableRuleInterface } from '../../interfaces/RuleInterfaces';
import { LOW } from '../helpers/priority';

export const fixedAmount: ApplicableRuleInterface = {
  slug: 'fixed_amount',
  description: 'Montant fixe',
  schema: {
    type: 'numeric',
    minimum: 0,
  },
  index: LOW,
  apply(params: number) {
    return async (ctx) => {
      ctx.result = params;
    };
  },
};
