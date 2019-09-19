export const retributionRuleSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['slug', 'parameters'],
  properties: {
    slug: {
      type: 'string',
    },
    parameters: {},
  },
};
