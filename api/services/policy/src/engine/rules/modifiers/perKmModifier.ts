import { ApplicableRuleInterface } from '../../../interfaces/RuleInterface';
import { LOWEST } from '../../helpers/priority';

export const perKmModifier: ApplicableRuleInterface = {
  slug: 'per_km_modifier',
  description: 'Le montant est multiplié par le nombre de km',
  schema: {
    type: 'boolean',
    const: true,
  },
  index: LOWEST,
  apply() {
    return async (ctx, next): Promise<void> => {
      await next();
      ctx.result *= ctx.person.distance / 1000;
    };
  },
};
