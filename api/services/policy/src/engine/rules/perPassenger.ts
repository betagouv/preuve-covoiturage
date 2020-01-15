import { ApplicableRuleInterface } from '../../interfaces/RuleInterface';
import { LOWEST } from '../helpers/priority';

export const perPassenger: ApplicableRuleInterface = {
  slug: 'per_passenger',
  description: 'Le montant est multiplié par le nombre total de passager',
  schema: {
    type: 'boolean',
    const: true,
  },
  index: LOWEST,
  apply() {
    return async (ctx, next): Promise<void> => {
      await next();
      ctx.result *= ctx.trip.people.filter((p) => !p.is_driver).reduce((acc, p) => acc + (p.seats || 1), 0);
    };
  },
};
