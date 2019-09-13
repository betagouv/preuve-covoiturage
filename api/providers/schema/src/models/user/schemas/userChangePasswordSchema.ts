export const userChangePasswordSchema = {
  $id: 'user.changePassword',
  type: 'object',
  required: ['old_password', 'new_password'],
  additionalProperties: false,
  properties: {
    old_password: { macro: 'password' },
    new_password: { macro: 'password' },
  },
};
