import { ApplicableRuleInterface } from '../../interfaces/RuleInterfaces';
import { LOW } from '../helpers/priority';

export const costBasedAmount: ApplicableRuleInterface = {
  slug: 'cost_based_amount',
  description: 'Montant correspondant au coût du trajet',
  schema: {
    type: 'boolean',
    const: true,
  },
  index: LOW,
  apply() {
    return async (ctx, next) => {
      ctx.result = ctx.person.contribution;
      return next();
    };
  },
};
