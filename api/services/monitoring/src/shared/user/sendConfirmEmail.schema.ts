export const sendConfirmEmail = {
  $id: 'user.sendConfirmEmail',
  type: 'object',
  required: ['_id'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'serial' },
  },
};

export const alias = sendConfirmEmail.$id;
