import { ApplicableRuleInterface } from '../../interfaces/RuleInterface';
import { HIGHEST } from '../helpers/priority';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';

interface MaxAmountParameters {
  target: string;
  amount: number;
  period: string;
}

export const maxAmountPerTargetRestriction: ApplicableRuleInterface = {
  slug: 'max_amount_per_target_restriction',
  description: 'Montant maximum par personne',
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
  apply(params: MaxAmountParameters) {
    return async (ctx, next): Promise<void> => {
      if (
        (params.target === 'driver' && !ctx.person.is_driver) ||
        (params.target === 'passenger' && ctx.person.is_driver)
      ) {
        return;
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

      const key = `${maxAmountPerTargetRestriction.slug}.${ctx.person.identity_uuid}.${params.period}.${keyPeriod}`;
      const periodConsuption = ctx.meta.get(key, 0);

      // test if consuption > limit
      if (periodConsuption >= params.amount) {
        throw new NotApplicableTargetException(maxAmountPerTargetRestriction);
      }

      await next();

      ctx.meta.set(key, periodConsuption + ctx.result);
    };
  },
};
