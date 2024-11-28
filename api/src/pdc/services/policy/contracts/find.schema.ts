export const alias = 'campaign.find';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['_id'],
  properties: {
    _id: {
      macro: 'serial',
    },
    operator_id: { macro: 'serial' },
    territory_id: {
      macro: 'serial',
    },
  },
};

export const binding = [alias, schema];
