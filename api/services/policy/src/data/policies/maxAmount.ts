import { RetributionRuleInterface } from '@pdc/provider-schema';

export const target: RetributionRuleInterface = {
  slug: 'max_amount',
  description: "Plafond d'unité par période",
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
  formula: '',
};
