export const alias = 'certificate.list';
export const schema = {
  $id: alias,
  type: 'object',
  additionalProperties: false,
  minProperties: 0,
  properties: {
    operator_id: { macro: 'serial' },
  },
};
export const binding = [alias, schema];
