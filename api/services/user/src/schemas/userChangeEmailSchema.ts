export const userChangeEmailSchema = {
  $id: 'user.changeEmail',
  type: 'object',
  additionalProperties: false,
  minProperties: 1,
  properties: {
    _id: { macro: 'objectid' },
    email: { macro: 'email' },
  },
};
