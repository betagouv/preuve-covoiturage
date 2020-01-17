export const alias = 'certificate.render';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['identity', 'start_at', 'end_at'],
  additionalProperties: false,
  properties: {
    identity: { type: 'string', maxLength: 64 },
    start_at: { macro: 'timestamp' },
    end_at: { macro: 'timestamp' },
    type: { type: 'string', enum: ['html', 'json'], maxLength: 4 },
  },
};
export const binding = [alias, schema];
