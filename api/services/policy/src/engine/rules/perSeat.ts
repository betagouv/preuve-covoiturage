import { ApplicableRuleInterface } from '../../interfaces/RuleInterface';
import { LOWEST } from '../helpers/priority';

export const perSeat: ApplicableRuleInterface = {
  slug: 'per_seat',
  description: 'Le montant est multiplié par le nombre de siège',
  schema: {
    type: 'boolean',
    const: true,
  },
  index: LOWEST,
  apply() {
    return async (ctx, next) => {
      await next();
      ctx.result *= ctx.person.seats || 1;
    };
  },
};
