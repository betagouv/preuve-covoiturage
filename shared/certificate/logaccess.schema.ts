export const alias = 'certificate.logaccess';
export const schema = {
  $id: alias,
  type: 'object',
  additionalProperties: false,
  required: ['user_agent'],
  properties: {
    ip: { type: 'string', format: { anyOf: ['ipv4', 'ipv6'] } },
    user_agent: { macro: 'longchar' },
    user_id: { macro: 'varchar' },
    content_type: {
      type: 'string',
      enum: ['application/pdf', 'image/png'],
    },
  },
};
export const binding = [alias, schema];
