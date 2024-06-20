export const changePassword = {
  $id: 'user.changePassword',
  type: 'object',
  required: ['_id', 'old_password', 'new_password'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'serial' },
    old_password: { macro: 'password' },
    new_password: { macro: 'password' },
  },
};

export const alias = changePassword.$id;
