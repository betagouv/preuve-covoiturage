import { ApplicableRuleInterface } from '../../interfaces/RuleInterfaces';
import { HIGH } from '../helpers/priority';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';

export const adultOnlyFilter: ApplicableRuleInterface = {
  slug: 'adult_only_filter',
  description: "La politique n'est applicable qu'aux personnes majeures",
  schema: {
    type: 'boolean',
    const: true,
  },
  index: HIGH,
  apply() {
    return async (ctx, next) => {
      if (!ctx.person.identity.over_18) {
        throw new NotApplicableTargetException(adultOnlyFilter);
      }
      return next();
    };
  },
};
