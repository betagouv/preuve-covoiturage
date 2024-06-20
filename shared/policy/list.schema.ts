import { policyStatusValues } from './common/interfaces/PolicyInterface';

export const alias = 'campaign.list';
export const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    territory_id: {
      anyOf: [
        { macro: 'serial' },
        {
          type: 'null',
        },
      ],
    },
    operator_id: { macro: 'serial' },
    status: {
      type: 'string',
      enum: policyStatusValues,
    },
    datetime: {
      macro: 'timestamp',
    },
  },
};

export const binding = [alias, schema];
