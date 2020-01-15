import { ApplicableRuleInterface } from '../../../interfaces/RuleInterface';
import { HIGH } from '../../helpers/priority';
import { NotApplicableTargetException } from '../../../exceptions/NotApplicableTargetException';

export const adultOnlyFilter: ApplicableRuleInterface = {
  slug: 'adult_only_filter',
  description: "La politique n'est applicable qu'aux personnes majeures",
  schema: {
    type: 'boolean',
    const: true,
  },
  index: HIGH,
  apply() {
    return async (ctx, next): Promise<void> => {
      // tslint:disable-next-line: no-boolean-literal-compare
      if ('is_over_18' in ctx.person && ctx.person.is_over_18 === false) {
        throw new NotApplicableTargetException(adultOnlyFilter);
      }
      return next();
    };
  },
};
