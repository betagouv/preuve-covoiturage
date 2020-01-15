export const alias = 'certificate.render';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['operator_user_id', 'start_at', 'end_at'],
  additionalProperties: false,
  properties: {
    operator_user_id: { type: 'string', format: 'uuid', maxLength: 64 },
    start_at: { macro: 'timestamp' },
    end_at: { macro: 'timestamp' },
  },
};
export const binding = [alias, schema];
