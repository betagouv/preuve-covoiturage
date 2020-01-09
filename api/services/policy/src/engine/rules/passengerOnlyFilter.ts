import { ApplicableRuleInterface } from '../../interfaces/RuleInterface';
import { HIGH } from '../helpers/priority';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';

export const passengerOnlyFilter: ApplicableRuleInterface = {
  slug: 'passenger_only_filter',
  description: "La politique n'est applicable qu'aux passagers",
  schema: {
    type: 'boolean',
    const: true,
  },
  index: HIGH,
  apply() {
    return async (ctx, next): Promise<void> => {
      if (ctx.person.is_driver) {
        throw new NotApplicableTargetException(passengerOnlyFilter);
      }
      return next();
    };
  },
};
