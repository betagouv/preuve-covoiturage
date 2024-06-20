import { territoryCodeSchema } from '../territory/common/schema';

export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['date'],
  properties: {
    tz: {
      macro: 'tz',
    },
    date: {
      type: 'object',
      additionalProperties: false,
      required: ['start', 'end'],
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
      oneOf: [
        {
          type: 'array',
          minItems: 1,
          items: { macro: 'serial' },
        },
        {
          macro: 'serial',
        },
      ],
    },
    geo_selector: territoryCodeSchema,
  },
};

export const alias = 'trip.export';
export const binding = [alias, schema];
