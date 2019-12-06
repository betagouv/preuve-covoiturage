import { ApplicableRuleInterface } from '../../interfaces/RuleInterface';
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
      if (!ctx.person.is_over_18) {
        throw new NotApplicableTargetException(adultOnlyFilter);
      }
      return next();
    };
  },
};
