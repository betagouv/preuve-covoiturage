export const validationSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['step', 'rank'],
  properties: {
    step: {
      type: 'integer',
      minimum: 1,
      maximum: 10,
    },
    validated: {
      type: 'boolean',
      default: false,
    },
    validatedAt: {
      type: { macro: 'timestamp' },
    },
    tests: {
      type: 'array',
    },
    rank: {
      type: 'string',
      maxLength: 1,
      enum: ['A', 'B', 'C', 'Z'],
    },
  },
};
