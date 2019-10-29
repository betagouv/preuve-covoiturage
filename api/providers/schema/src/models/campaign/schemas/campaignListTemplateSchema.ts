export const campaignListTemplateSchema = {
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
