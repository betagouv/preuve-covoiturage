export const alias = 'certificate.print';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['operator_user_id'],
  additionalProperties: false,
  properties: {
    operator_user_id: { type: 'string', format: 'uuid', maxLength: 64 },
    start_at: { macro: 'timestamp' },
    end_at: { macro: 'timestamp' },
  },
};
export const binding = [alias, schema];
