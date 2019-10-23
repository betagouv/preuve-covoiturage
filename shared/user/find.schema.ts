export const find = {
  $id: 'user.find',
  type: 'object',
  required: ['_id'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'objectid' },
  },
};

export const alias = find.$id;
