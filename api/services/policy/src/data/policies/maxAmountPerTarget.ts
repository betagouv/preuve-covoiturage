import { RetributionRuleInterface } from '@pdc/provider-schema';

export const maxAmountPerTarget: RetributionRuleInterface = {
  slug: 'max_amount_per_target',
  description: 'Montant maximum par personne',
  schema: {
    type: 'object',
    required: ['target', 'amount', 'period'],
    additionnalProperties: false,
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
        enum: ['day', 'week', 'month', 'year', 'campaign'],
      },
    },
  },
  formula: '',
};
