import { RetributionRuleInterface } from '@pdc/provider-schema';

export const target: RetributionRuleInterface = {
  slug: 'target',
  description: 'La politique est applicable sur les passagers, les conducteurs, les deux ou le trajet.',
  schema: {
    type: 'object',
    required: ['driver', 'passenger', 'trip'],
    additionnalProperties: false,
    properties: {
      driver: {
        type: 'boolean',
      },
      passenger: {
        type: 'boolean',
      },
      trip: {
        type: 'boolean',
      },
    },
    if: {
      properties: {
        trip: {
          const: true,
        },
      },
    },
    then: {
      properties: {
        passenger: {
          const: false,
        },
        driver: {
          const: false,
        },
      },
    },
  },
  formula: '',
};
