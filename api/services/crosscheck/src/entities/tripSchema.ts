export const tripSchema = {
  $id: 'trip',
  type: 'object',
  required: [], // todo: complete
  additionalProperties: false,
  properties: {
    operatorId: { macro: 'objectid' },
    operatorJourneyId: { macro: 'objectid' },
    territory: {
      type: 'array',
      items: { macro: 'objectid' },
    },
    status: {
      type: 'string',
      enum: ['pending', 'active', 'error'],
      default: 'pending',
    },
    start: { marco: 'position' },
    // todo: complete
    createdAt: { macro: 'timestamp' },
    updatedAt: { macro: 'timestamp' },
    deletedAt: { macro: 'timestamp' },
  },
};
