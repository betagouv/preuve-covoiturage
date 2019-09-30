import { ApplicableRuleInterface } from '../../interfaces/RuleInterfaces';
import { LOWEST } from '../helpers/priority';

export const perPassenger: ApplicableRuleInterface = {
  slug: 'per_passenger',
  description: 'Le montant est multiplié par le nombre de passager',
  schema: {
    type: 'boolean',
    const: true,
  },
  index: LOWEST,
  apply() {
    return async (ctx, next) => {
      await next();
      const nb = ctx.trip.people.reduce((acc, people) => {
        if (people.is_driver) {
          return acc;
        }
        return acc + ('seats' in people && people.seats ? people.seats : 1);
      }, 0);
      ctx.result *= nb;
    };
  },
};
