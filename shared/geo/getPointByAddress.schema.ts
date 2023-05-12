export const alias = 'geo.getPointByAddress';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['country', 'litteral'],
  additionalProperties: false,
  properties: {
    country: { macro: 'varchar' },
    litteral: { macro: 'varchar' },
  },
};
export const binding = [alias, schema];
