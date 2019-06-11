export const userConfirmEmailSchema = {
  $id: 'user.confirmEmail',
  type: 'object',
  required: ['confirm', 'token'],
  additionalProperties: false,
  properties: {
    confirm: {
      type: 'string',
      maxLength: 255,
      minLength: 1,
    },
    token: {
      type: 'string',
      maxLength: 255,
      minLength: 1,
    },
  },
};
