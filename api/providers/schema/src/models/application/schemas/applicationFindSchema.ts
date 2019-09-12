export const applicationFindSchema = {
  $id: 'application.find',
  type: 'object',
  required: ['_id'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'objectid' },
    operator_id: { macro: 'objectid' },
    deleted_at: { type: 'string', format: 'date-time', nullable: true, maxLength: 26 },
  },
};
