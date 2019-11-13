export const alias = 'territory.listOperator';

export const schema = {
  $id: alias,
  type: 'object',
  additionalProperties: false,
  minProperties: 1,
  maxProperties: 1,
  properties: {
    operator_id: {
      macro: 'serial',
    },
    territory_id: {
      macro: 'serial',
    },
  },
};

export const binding = [ alias, schema ];
