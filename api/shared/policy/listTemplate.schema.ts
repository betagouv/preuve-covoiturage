export const alias = 'campaign.listTemplate';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['territory_id'],
  properties: {
    territory_id: {
      anyOf: [
        { macro: 'objectid' },
        {
          type: 'null',
        },
      ],
    },
  },
};

export const binding = [alias, schema];
