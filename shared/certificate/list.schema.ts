export const alias = 'certificate.list';
export const schema = {
  $id: alias,
  type: 'object',
  additionalProperties: false,
  minProperties: 0,
  properties: {
    operator_id: { macro: 'serial' },
    pagination: {
      minProperties: 0,
      maxProperties: 2,
      properties: {
        length: { type: 'number' },
        start_index: { type: 'number' },
      },
    },
  },
};
export const binding = [alias, schema];
