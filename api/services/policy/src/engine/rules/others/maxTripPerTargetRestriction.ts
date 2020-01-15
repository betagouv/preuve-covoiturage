import { ApplicableRuleInterface } from '../../../interfaces/RuleInterface';
import { HIGHEST } from '../../helpers/priority';
import { NotApplicableTargetException } from '../../../exceptions/NotApplicableTargetException';

interface MaxTripParameters {
  target: 'driver' | 'passenger';
  amount: number;
  period: 'day' | 'month' | 'year' | 'campaign';
}

export const maxTripPerTargetRestriction: ApplicableRuleInterface = {
  slug: 'max_trip_per_target_restriction',
  description: 'Trajet maximum par personne',
  schema: {
    type: 'object',
    required: ['target', 'amount', 'period'],
    additionalProperties: false,
    properties: {
      target: {
        type: 'string',
        enum: ['driver', 'passenger'],
      },
      amount: {
        type: 'integer',
        minimum: 0,
      },
      period: {
        type: 'string',
        enum: ['day', 'month', 'year', 'campaign'],
      },
    },
  },
  index: HIGHEST,
  apply(params: MaxTripParameters) {
    return async (ctx, next): Promise<void> => {
      if (
        (params.target === 'driver' && !ctx.person.is_driver) ||
        (params.target === 'passenger' && ctx.person.is_driver)
      ) {
        return next();
      }

      const datetime = ctx.person.datetime;
      const [day, month, year] = [datetime.getDate(), datetime.getMonth(), datetime.getFullYear()];
      let keyPeriod = 'global';
      switch (params.period) {
        case 'day':
          keyPeriod = `${day}-${month}-${year}`;
          break;
        case 'month':
          keyPeriod = `${month}-${year}`;
          break;
        case 'year':
          keyPeriod = `${year}`;
          break;
      }

      const key = `${maxTripPerTargetRestriction.slug}.${ctx.person.identity_uuid}.${params.period}.${keyPeriod}`;
      const periodConsuption = ctx.meta.get(key, 0);

      // test if consuption > limit
      if (periodConsuption >= params.amount) {
        throw new NotApplicableTargetException(maxTripPerTargetRestriction);
      }

      await next();

      ctx.meta.set(key, periodConsuption + 1);
    };
  },
};
