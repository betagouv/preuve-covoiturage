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
      enum: ['template', 'draft', 'active', 'finished'],
    },
  },
};

export const binding = [alias, schema];
