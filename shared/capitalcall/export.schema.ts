export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['query'],
  properties: {
    query: {
      type: 'object',
      additionalProperties: false,
      required: ['campaign_id'],
      properties: {
        date: {
          type: 'object',
          additionalProperties: false,
          minProperties: 1,
          properties: {
            start: {
              macro: 'timestamp',
            },
            end: {
              macro: 'timestamp',
            },
          },
        },
        campaign_id: {
          type: 'array',
          minItems: 1,
          items: { macro: 'serial' },
        },
      },
    },
    format: {
      type: 'object',
      additionalProperties: false,
      required: ['tz'],
      properties: {
        tz: { macro: 'tz' },
      },
    },
  },
};

export const alias = 'capitalcall.export';
export const binding = [alias, schema];
