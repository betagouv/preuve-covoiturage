import { ApplicableRuleInterface } from '../../interfaces/RuleInterfaces';
import { HIGH } from '../helpers/priority';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';

type WeekdayParameters = number[];

export const weekdayFilter: ApplicableRuleInterface = {
  slug: 'weekday_filter',
  description: "La politique n'est applicable qu'aux personnes majeures",
  schema: {
    type: 'array',
    items: {
      type: 'integer',
      minimum: 0,
      maximum: 6,
    },
  },
  index: HIGH,
  apply(params: WeekdayParameters) {
    return async (ctx, next) => {
      const wk = ctx.person.start.datetime.getDay();
      for (const weekday of params) {
        if (wk === weekday) {
          return next();
        }
      }
      throw new NotApplicableTargetException(weekdayFilter);
    };
  },
};
