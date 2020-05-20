export const alias = 'certificate.render';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['uuid', 'token'],
  additionalProperties: false,
  properties: {
    uuid: { macro: 'uuid' },
    token: { macro: 'jwt' },
  },
};
export const binding = [alias, schema];
