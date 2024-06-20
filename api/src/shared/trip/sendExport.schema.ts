import { territoryCodeSchema } from '../territory/common/schema.ts';

export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['query', 'from', 'format'],
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
    from: {
      type: 'object',
      additionalProperties: false,
      required: ['email', 'fullname'],
      properties: {
        email: {
          macro: 'email',
        },
        fullname: {
          macro: 'varchar',
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
        tz: { macro: 'tz' },
      },
    },
  },
};

export const alias = 'trip.sendExport';
export const binding = [alias, schema];
