export const alias = 'territory.updateOperator';

export const schema = {
  $id: alias,
  type: 'object',
  additionalProperties: false,
  required: ['operator_id', 'territory_id'],
  properties: {
    operator_id: {
      macro: 'serial',
    },
    territory_id: {
      type: 'array',
      items: {
        macro: 'serial',
      },
    },
  },
};

export const binding = [alias, schema];
