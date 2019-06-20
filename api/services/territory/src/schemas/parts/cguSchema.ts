export const cguSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    accepted: {
      type: 'boolean',
      default: false,
    },
    acceptedAt: { macro: 'timestamp' },
    acceptedBy: { macro: 'objectid' },
  },
};
