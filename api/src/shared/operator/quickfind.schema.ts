export const alias = 'operator.quickfind';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['_id'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'serial' },
    thumbnail: { type: 'boolean' },
  },
};
export const binding = [alias, schema];
