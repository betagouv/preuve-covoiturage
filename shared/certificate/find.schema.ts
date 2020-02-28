export const alias = 'certificate.find';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['uuid'],
  additionalProperties: false,
  properties: {
    uuid: { macro: 'uuid' },
  },
};
export const binding = [alias, schema];
