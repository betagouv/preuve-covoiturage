export const userSendConfirmEmailSchema = {
  $id: 'user.sendConfirmEmail',
  type: 'object',
  required: ['_id'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'objectid' },
  },
};
