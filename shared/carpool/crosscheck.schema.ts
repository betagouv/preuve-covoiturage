import { identity } from './common/identity.schema';

const positionSchema = {
  type: 'object',
  required: ['lat', 'lon', 'geo_code'],
  additionalProperties: false,
  properties: {
    lat: { macro: 'lat' },
    lon: { macro: 'lon' },
    geo_code: { macro: 'insee' },
  },
};

const incentivesSchema = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    required: ['index', 'amount', 'siret'],
    properties: {
      index: {
        type: 'integer',
        minimum: 0,
        maximum: 64,
      },
      amount: {
        type: 'integer',
        minimum: 0,
        maximum: 1000000,
      },
      siret: {
        macro: 'siret',
      },
    },
  },
};

export const alias = 'carpool.crosscheck';
export const schema = {
  $id: alias,
  type: 'object',
  required: [
    'acquisition_id',
    'operator_id',
    'operator_journey_id',
    'created_at',
    'operator_class',
    'people',
    'incentives',
  ],
  additionalProperties: false,
  properties: {
    operator_trip_id: { macro: 'varchar' },
    acquisition_id: { macro: 'serial' },
    operator_id: { macro: 'serial' },
    operator_journey_id: { macro: 'varchar' },
    created_at: {
      anyOf: [{ macro: 'timestamp' }, { instanceof: 'Date' }],
    },
    operator_class: { enum: ['A', 'B', 'C'] },
    incentives: incentivesSchema,
    people: {
      type: 'array',
      items: {
        type: 'object',
        required: ['is_driver', 'datetime', 'start', 'end', 'seats', 'duration', 'identity', 'cost', 'payment', 'meta'],
        additionalProperties: false,
        properties: {
          identity,
          incentives: incentivesSchema,
          is_driver: { type: 'boolean' },
          datetime: { macro: 'timestamp' },
          start: positionSchema,
          end: positionSchema,
          seats: {
            type: 'integer',
            default: 0,
            minimum: 0,
            maximum: 8,
          },
          duration: {
            type: 'integer',
            minimum: 0,
            maximum: 86400,
          },
          distance: {
            type: 'integer',
            minimum: 0,
            maximum: 1000000,
          },
          cost: {
            type: 'integer',
            minimum: -1000000,
            maximum: 1000000,
          },
          payment: {
            type: 'integer',
            minimum: -1000000,
            maximum: 1000000,
          },
          meta: {
            type: 'object',
            required: ['payments', 'calc_distance', 'calc_duration'],
            additionalProperties: false,
            properties: {
              payments: {
                type: 'array',
                minItems: 0,
                maxItems: 20,
                items: {
                  type: 'object',
                  required: ['index', 'siret', 'type', 'amount'],
                  additionalProperties: false,
                  properties: {
                    index: {
                      type: 'integer',
                      minimum: 0,
                      maximum: 19,
                    },
                    siret: { macro: 'siret' },
                    type: { macro: 'varchar' },
                    amount: {
                      type: 'integer',
                      minimum: 0,
                      maximum: 100000,
                    },
                  },
                },
              },
              calc_distance: { type: 'integer', minimum: 0, maximum: 2147483647 },
              calc_duration: { type: 'integer', minimum: 0, maximum: 2147483647 },
            },
          },
        },
      },
    },
  },
};

export const binding = [alias, schema];
