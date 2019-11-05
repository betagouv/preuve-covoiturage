export const alias = 'campaign.delete';

export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'territory_id'],
  properties: {
    _id: {
      macro: 'dbid',
    },
    territory_id: {
      macro: 'dbid',
    },
  },
};

export const binding = [alias, schema];
