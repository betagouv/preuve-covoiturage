import { RetributionRuleInterface } from '@pdc/provider-schema';

export const retributionMeltingpot: RetributionRuleInterface = {
  slug: 'retribution_meltingpot',
  description: 'Le montant',
  schema: {
    type: 'object',
    required: ['max', 'min', 'for_driver', 'for_passenger'],
    additionalProperties: false,
    properties: {
      max: {
        type: 'integer',
        minimum: -1,
      },
      min: {
        type: 'integer',
        minimum: -1,
      },
      for_driver: {
        type: 'object',
        additionalProperties: false,
        required: ['per_km', 'per_passenger', 'amount'],
        properties: {
          per_km: {
            type: 'boolean',
          },
          per_passenger: {
            type: 'boolean',
          },
          amount: {
            type: 'integer',
            minimum: 0,
          },
        },
      },
      for_passenger: {
        type: 'object',
        additionalProperties: false,
        required: ['per_km', 'free', 'amount'],
        properties: {
          per_km: {
            type: 'boolean',
          },
          free: {
            type: 'boolean',
          },
          amount: {
            type: 'integer',
            minimum: 0,
          },
        },
      },
    },
  },
  formula: '',
};
