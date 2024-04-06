export const alias = 'operator.findbyuuid';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['uuid'],
  additionalProperties: false,
  properties: {
    uuid: {
      type: 'array',
      items: { macro: 'uuid' },
      minItems: 1,
      maxItems: 50,
    },
  },
};
export const binding = [alias, schema];
