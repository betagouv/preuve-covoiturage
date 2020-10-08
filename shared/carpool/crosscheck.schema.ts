const positionSchema = {
  type: 'object',
  required: ['lat', 'lon', 'territory_id'],
  additionalProperties: false,
  properties: {
    lat: { macro: 'lat' },
    lon: { macro: 'lon' },
    territory_id: { macro: 'serial' },
  },
};

export const alias = 'carpool.crosscheck';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['acquisition_id', 'operator_id', 'operator_journey_id', 'created_at', 'operator_class', 'people'],
  additionalProperties: false,
  properties: {
    operator_trip_id: { macro: 'varchar' },
    acquisition_id: { macro: 'serial' },
    operator_id: { macro: 'serial' },
    operator_journey_id: { macro: 'varchar' },
    created_at: { macro: 'timestamp' },
    operator_class: { enum: ['A', 'B', 'C'] },
    people: {
      type: 'array',
      items: {
        type: 'object',
        required: ['is_driver', 'datetime', 'start', 'end', 'seats', 'duration', 'identity', 'cost', 'meta'],
        additionalProperties: false,
        properties: {
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
          identity: {
            type: 'object',
            additionalProperties: false,
            anyOf: [{ required: ['phone'] }, { required: ['phone_trunc', 'operator_user_id'] }],
            properties: {
              firstname: { macro: 'varchar' },
              lastname: { macro: 'varchar' },
              email: { macro: 'email' },
              phone: { macro: 'phone' },
              company: { macro: 'varchar' },
              over_18: { enum: [true, false, null] },
              phone_trunc: { macro: 'varchar' },
              operator_user_id: { macro: 'varchar' },
              travel_pass_name: { macro: 'varchar' },
              travel_pass_user_id: { macro: 'varchar' },
            },
          },
          cost: {
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
              calc_distance: {
                type: 'integer',
                exclusiveMinimum: 0,
              },
              calc_duration: {
                type: 'integer',
                exclusiveMinimum: 0,
              },
            },
          },
        },
      },
    },
  },
};

export const binding = [alias, schema];
