export const cgu = {
  type: 'object',
  additionalProperties: false,
  properties: {
    accepted: {
      type: 'boolean',
      default: false,
    },
    accepted_at: { macro: 'timestamp' },
    accepted_by: { macro: 'dbid' },
  },
};
