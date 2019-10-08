import { ApplicableRuleInterface } from '../../interfaces/RuleInterfaces';
import { HIGHEST } from '../helpers/priority';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';

interface MaxAmountParameters {
  amount: number;
  period: string;
}

export const maxAmountRestriction: ApplicableRuleInterface = {
  slug: 'max_amount_restriction',
  description: "Plafond d'unité par période",
  schema: {
    type: 'object',
    required: ['amount', 'period'],
    additionalProperties: false,
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
  apply(params: MaxAmountParameters) {
    return async (ctx, next) => {
      const datetime = ctx.person.start.datetime;
      const [month, year] = [datetime.getMonth(), datetime.getFullYear()];
      let keyPeriod = 'global';
      if (params.period === 'month') {
        keyPeriod = `${month}-${year}`;
      }

      const key = `${maxAmountRestriction.slug}.${params.period}.${keyPeriod}`;
      const periodConsuption = ctx.meta.get(key, 0);

      // test if consuption > limit
      if (periodConsuption >= params.amount) {
        throw new NotApplicableTargetException(maxAmountRestriction);
      }

      await next();

      ctx.meta.set(key, periodConsuption + ctx.result);
    };
  },
};
