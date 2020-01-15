import { ApplicableRuleInterface } from '../../../interfaces/RuleInterface';
import { HIGH } from '../../helpers/priority';
import { NotApplicableTargetException } from '../../../exceptions/NotApplicableTargetException';

interface Range {
  start: number;
  end: number;
}

type TimeRangeParameters = Range[];

export const timeRangeFilter: ApplicableRuleInterface = {
  slug: 'time_range_filter',
  description: 'Filtre par horaire',
  schema: {
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: false,
      required: ['start', 'end'],
      properties: {
        start: {
          type: 'integer',
          minimum: 0,
          maximum: 23,
        },
        end: {
          type: 'integer',
          minimum: 0,
          maximum: 23,
        },
      },
    },
  },
  index: HIGH,
  apply(params: TimeRangeParameters) {
    return async (ctx, next): Promise<void> => {
      const hours = ctx.person.datetime.getHours();
      for (const range of params) {
        if (hours >= range.start && hours <= range.end) {
          return next();
        }
      }
      throw new NotApplicableTargetException(timeRangeFilter);
    };
  },
};
