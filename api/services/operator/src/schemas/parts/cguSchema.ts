export const cguSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    accepted: {
      type: 'boolean',
      default: false,
    },
    acceptedAt: {
      type: 'string',
      format: 'datetime',
    },
    acceptedBy: {
      type: 'string',
      format: 'objectid',
    },
  },
};
