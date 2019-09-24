export const ruleSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['slug', 'parameters'],
  properties: {
    slug: {
      type: 'string',
    },
    parameters: {
      default: null,
    },
  },
};
