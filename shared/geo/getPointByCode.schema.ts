export const alias = 'get.getPointByCode';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['code'],
  additionalProperties: false,
  properties: {
    code: { macro: 'insee' },
  },
};
export const binding = [alias, schema];
