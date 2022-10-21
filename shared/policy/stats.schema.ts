export const alias = 'policy.stats';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['_id'],
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
