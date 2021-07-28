export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['query'],
  properties: {
    query: {
      type: 'object',
      additionalProperties: false,
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
        territory_id: {
          type: 'integer',
          minItems: 1,
          items: { macro: 'serial' },
        },
        campaign_id: {
          type: 'array',
          minItems: 1,
          items: { macro: 'serial' },
        }
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

export const alias = 'trip.buildExcelExport';
export const binding = [alias, schema];
