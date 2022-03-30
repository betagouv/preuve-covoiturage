import { utcToZonedTime } from '../../helpers/utcToZonedTime';
import { RuleHandlerContextInterface } from '../../interfaces';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { FilterRule } from '../FilterRule';

interface DateFilterInterface {
  whitelist?: string[];
  blacklist?: string[];
  tz?: string;
}

export class DateFilter extends FilterRule<DateFilterInterface> {
  static readonly slug: string = 'date_filter';
  static readonly description: string = 'Filtre par date';
  static readonly schema: { [k: string]: any } = {
    type: 'object',
    additionalProperties: false,
    properties: {
      blacklist: {
        type: 'array',
        items: {
          type: 'string',
          format: 'date',
          minLength: 1,
          maxLength: 100,
        },
      },
      whitelist: {
        type: 'array',
        items: {
          type: 'string',
          format: 'date',
          minLength: 1,
          maxLength: 100,
        },
      },
      tz: {
        macro: 'tz',
      },
    },
  };
  filter(ctx: RuleHandlerContextInterface): void {
    const dateStr = utcToZonedTime(ctx.person.datetime, this.parameters.tz).toISOString();
    const ctxDate = dateStr.split('T')[0];
    if (Array.isArray(this.parameters.whitelist)) {
      if (this.parameters.whitelist.indexOf(ctxDate) >= 0) {
        return;
      }
      throw new NotApplicableTargetException(DateFilter.description);
    }
    if (Array.isArray(this.parameters.blacklist)) {
      if (this.parameters.blacklist.indexOf(ctxDate) >= 0) {
        throw new NotApplicableTargetException(DateFilter.description);
      }
      return;
    }
  }
}
