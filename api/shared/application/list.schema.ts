export const alias = 'application.list';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['operator_id'],
  additionalProperties: false,
  properties: {
    operator_id: { macro: 'dbid' },
  },
};
export const binding = [alias, schema];
