export const alias = 'certificate.create';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['identity'],
  additionalProperties: false,
  properties: {
    identity: { type: 'string', maxLength: 64 },
    start_at: { macro: 'timestamp' },
    end_at: { macro: 'timestamp' },
  },
};
export const binding = [alias, schema];
