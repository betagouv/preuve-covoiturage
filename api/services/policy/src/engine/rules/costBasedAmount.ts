import { ApplicableRuleInterface } from '../../interfaces/RuleInterface';
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
    return async (ctx, next): Promise<void> => {
      ctx.result = Math.abs(ctx.person.cost); // TODO passenger only ?
      return next();
    };
  },
};
