export const deleteUser = {
  $id: 'user.delete',
  type: 'object',
  required: ['_id'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'serial' },
  },
};

export const alias = deleteUser.$id;
