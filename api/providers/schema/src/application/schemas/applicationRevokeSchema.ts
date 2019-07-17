export const applicationRevokeSchema = {
  $id: 'application.revoke',
  type: 'object',
  required: ['_id'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'objectid' },
  },
};
