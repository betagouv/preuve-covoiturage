export const alias = 'campaign.delete';

export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'territory_id'],
  properties: {
    _id: {
      macro: 'serial',
    },
    territory_id: {
      macro: 'serial',
    },
  },
};

export const binding = [alias, schema];
