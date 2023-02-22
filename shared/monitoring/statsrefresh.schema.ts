export const alias = 'monitoring.statsrefresh';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['schema'],
  properties: {
    schema: {
      type: 'string',
      minLength: 1,
      maxLength: 64,
    },
  },
};
export const binding = [alias, schema];
