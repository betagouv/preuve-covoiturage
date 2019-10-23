export const alias = 'campaign.delete';

export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'territory_id'],
  properties: {
    _id: {
      macro: 'objectid',
    },
    territory_id: {
      macro: 'objectid',
    },
  },
};

export const binding = [alias, schema];
