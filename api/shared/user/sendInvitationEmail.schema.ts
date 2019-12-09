export const sendInvitationEmail = {
  $id: 'user.sendInvitationEmail',
  type: 'object',
  required: ['_id'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'serial' },
  },
};

export const alias = sendInvitationEmail.$id;
