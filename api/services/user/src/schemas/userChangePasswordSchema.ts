export const userChangePasswordSchema = {
  $id: 'user.changePassword',
  type: 'object',
  required: ['id', 'oldPassword', 'newPassword'],
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
      maxLength: 255,
      minLength: 6,
    },
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
