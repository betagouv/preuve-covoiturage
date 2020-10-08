import { RuleHandlerContextInterface } from '../../interfaces';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { FilterRule } from '../FilterRule';

export class WeekdayFilter extends FilterRule<number[]> {
  static readonly slug: string = 'weekday_filter';
  static readonly description: string = "La politique n'est applicable que sur les jours indiqués";
  static readonly schema: { [k: string]: any } = {
    type: 'array',
    items: {
      type: 'integer',
      minimum: 0,
      maximum: 6,
    },
  };
  filter(ctx: RuleHandlerContextInterface): void {
    const date = ctx.person.datetime;
    const day = typeof date.getDay === 'function' ? date.getDay() : new Date(date).getDay();
    if (this.parameters.indexOf(day) < 0) {
      throw new NotApplicableTargetException(WeekdayFilter.description);
    }
  }
}
