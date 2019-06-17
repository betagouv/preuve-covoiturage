export const userChangePasswordSchema = {
  $id: 'user.changePassword',
  type: 'object',
  required: ['oldPassword', 'newPassword'],
  additionalProperties: false,
  properties: {
    oldPassword: {
      type: 'string',
      maxLength: 128,
      minLength: 6,
    },
    newPassword: {
      type: 'string',
      maxLength: 128,
      minLength: 6,
    },
  },
};
