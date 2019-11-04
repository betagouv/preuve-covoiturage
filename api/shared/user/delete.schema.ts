export const deleteUser = {
  $id: 'user.delete',
  type: 'object',
  required: ['_id'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'dbid' },
  },
};

export const alias = deleteUser.$id;
