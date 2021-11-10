export const alias = 'territory.getAuthorizedCodes';
export const schema = {
  $id: alias,
  type: 'object',
  // required: ['_id'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'serial' },
    _ids: {
      type: 'array',
      items: { macro: 'serial' },
    },
  },
};
export const binding = [alias, schema];
