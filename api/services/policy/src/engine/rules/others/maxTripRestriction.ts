import { ApplicableRuleInterface } from '../../../interfaces/RuleInterface';
import { HIGHEST } from '../../helpers/priority';
import { NotApplicableTargetException } from '../../../exceptions/NotApplicableTargetException';

interface MaxTripParameters {
  amount: number;
  period: 'month' | 'campaign';
}

export const maxTripRestriction: ApplicableRuleInterface = {
  slug: 'max_trip_restriction',
  description: 'Plafond de trajet par période',
  schema: {
    type: 'object',
    required: ['amount', 'period'],
    additionnalProperties: false,
    properties: {
      amount: {
        type: 'integer',
        minimum: 0,
      },
      period: {
        type: 'string',
        enum: ['month', 'campaign'],
      },
    },
  },
  index: HIGHEST,
  apply(params: MaxTripParameters) {
    return async (ctx, next): Promise<void> => {
      const datetime = ctx.person.datetime;
      const [month, year] = [datetime.getMonth(), datetime.getFullYear()];

      let keyPeriod = 'global';
      if (params.period === 'month') {
        keyPeriod = `${month}-${year}`;
      }

      const key = `${maxTripRestriction.slug}.${params.period}.${keyPeriod}`;
      const periodConsuption = ctx.meta.get(key, 0);

      // test if consuption > limit
      if (periodConsuption >= params.amount) {
        throw new NotApplicableTargetException(maxTripRestriction);
      }

      await next();

      ctx.meta.set(key, periodConsuption + 1);
    };
  },
};
