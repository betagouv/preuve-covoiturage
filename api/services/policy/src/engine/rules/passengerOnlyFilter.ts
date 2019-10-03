import { ApplicableRuleInterface } from '../../interfaces/RuleInterfaces';
import { HIGH } from '../helpers/priority';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';

export const passengerOnlyFilter: ApplicableRuleInterface = {
  slug: 'driver_only_filter',
  description: "La politique n'est applicable qu'aux passagers",
  schema: {
    type: 'boolean',
    const: true,
  },
  index: HIGH,
  apply() {
    return async (ctx, next) => {
      if (ctx.person.is_driver) {
        throw new NotApplicableTargetException(passengerOnlyFilter);
      }
      return next();
    };
  },
};
