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
    status: {
      type: 'string',
      enum: ['template', 'draft', 'active', 'finished'],
    },
  },
};

export const binding = [alias, schema];
