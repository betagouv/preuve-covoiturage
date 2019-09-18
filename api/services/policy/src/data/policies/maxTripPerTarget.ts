import { RetributionRuleInterface } from '@pdc/provider-schema';

export const maxTripPerTarget: RetributionRuleInterface = {
  slug: 'max_trip_per_target',
  description: 'Trajet maximum par personne',
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
