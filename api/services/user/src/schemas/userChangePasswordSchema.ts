export const userChangePasswordSchema = {
  $id: 'user.changePassword',
  type: 'object',
  required: ['oldPassword', 'newPassword'],
  additionalProperties: false,
  properties: {
    oldPassword: { macro: 'password' },
    newPassword: { macro: 'password' },
  },
};
