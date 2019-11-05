export const changeRole = {
  $id: 'user.changeRole',
  type: 'object',
  required: ['_id', 'role'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'dbid' },
    role: { macro: 'role' },
  },
};

export const alias = changeRole.$id;
