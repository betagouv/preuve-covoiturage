import { ApplicableRuleInterface } from '../../../interfaces/RuleInterface';
import { LOW } from '../../helpers/priority';

export const fixedAmountSetter: ApplicableRuleInterface = {
  slug: 'fixed_amount_setter',
  description: 'Montant fixe',
  schema: {
    type: 'integer',
    minimum: 0,
  },
  index: LOW,
  apply(params: number) {
    return async (ctx, next): Promise<void> => {
      ctx.result = params;
      return next();
    };
  },
};
