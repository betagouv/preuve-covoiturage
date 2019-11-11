export const alias = 'certificate.print';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['user_id'],
  additionalProperties: false,
  properties: {
    _id: { type: 'string', format: 'uuid' },
  },
};
export const binding = [alias, schema];
