export const alias = 'operator.patchThumbnail';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['_id', 'thumbnail'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'serial' },
    thumbnail: { anyOf: [{ macro: 'base64' }, { type: 'null' }] },
  },
};
export const binding = [alias, schema];
