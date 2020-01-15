import { ApplicableRuleInterface } from '../../../interfaces/RuleInterface';
import { HIGH } from '../../helpers/priority';
import { NotApplicableTargetException } from '../../../exceptions/NotApplicableTargetException';

export const distanceRangeFilter: ApplicableRuleInterface = {
  slug: 'distance_range_filter',
  description: 'Filtre par distance',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      min: {
        type: 'integer',
        minimum: 0,
        maximum: 100000,
      },
      max: {
        type: 'integer',
        minimum: 0,
        maximum: 500000,
      },
    },
  },
  index: HIGH,
  apply(params: { min: number; max: number }) {
    return async (ctx, next): Promise<void> => {
      if (ctx.person.distance >= params.max || ctx.person.distance <= params.min) {
        throw new NotApplicableTargetException(distanceRangeFilter);
      }
      return next();
    };
  },
};
