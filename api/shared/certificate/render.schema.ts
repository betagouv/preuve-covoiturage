export const alias = 'certificate.render';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['uuid', 'token'],
  additionalProperties: false,
  properties: {
    uuid: { type: 'string', format: 'uuid', minLength: 36, maxLength: 36 },
    token: {
      type: 'string',
      pattern: '^ey[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+$',
      minLength: 32,
      maxLength: 512,
    },
  },
};
export const binding = [alias, schema];
