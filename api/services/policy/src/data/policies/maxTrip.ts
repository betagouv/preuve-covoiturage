import { RetributionRuleInterface } from '@pdc/provider-schema';

export const maxTrip: RetributionRuleInterface = {
  slug: 'max_trip',
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
  formula: '',
};
