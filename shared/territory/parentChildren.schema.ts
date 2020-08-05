export const alias = 'territory.getParentChildren';
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
