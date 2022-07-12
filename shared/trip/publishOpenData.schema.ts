export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['filepath', 'tripSearchQueryParam'],
  properties: {
    filepath: {
      macro: 'varchar',
    },
    tripSearchQueryParam: {
      type: 'object',
      additionalProperties: false,
      required: ['date'],
      properties: {
        date: {
          type: 'object',
        },
        status: {
          macro: 'varchar',
        },
        excluded_start_geo_code: {
          type: 'array',
          items: { macro: 'insee' },
        },
        excluded_end_geo_code: {
          type: 'array',
          items: { macro: 'insee' },
        },
      },
    },
    excludedTerritories: {
      type: 'array',
      items: { type: 'object' },
    },
  },
};

export const alias = 'trip.publishOpenData';
export const binding = [alias, schema];
