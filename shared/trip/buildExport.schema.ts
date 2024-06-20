import { territoryCodeSchema } from '../territory/common/schema';

export const schema = {
  anyOf: [
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        query: {
          type: 'object',
          additionalProperties: false,
          required: ['date'],
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
            operator_id: {
              type: 'array',
              minItems: 1,
              items: { macro: 'serial' },
            },
            geo_selector: territoryCodeSchema,
            territory_authorized_operator_id: {
              type: 'array',
              items: { macro: 'serial' },
            },
          },
        },
        type: {
          macro: 'varchar',
        },
        format: {
          type: 'object',
          additionalProperties: false,
          required: ['tz'],
          properties: {
            filename: { macro: 'varchar' },
            tz: { macro: 'tz' },
          },
        },
      },
    },
    {
      type: 'object',
      additionalProperties: false,
      required: ['type'],
      properties: {
        type: { const: 'opendata' },
      },
    },
  ],
};

export const alias = 'trip.buildExport';
export const binding = [alias, schema];
