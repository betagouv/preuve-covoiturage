export const alias = 'campaign.launch';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['_id'],
  properties: {
    _id: {
      macro: 'dbid',
    },
  },
};

export const binding = [alias, schema];
