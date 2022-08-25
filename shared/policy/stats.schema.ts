export const alias = 'campaign.stats';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['_id'],
  properties: {
    _id: {
      macro: 'serial',
    },
  },
};

export const binding = [alias, schema];
