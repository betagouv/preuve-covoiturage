function positionSchema(isStart = true) {
    return {
    type: 'object',
    required: ['datetime', 'lat', 'lon'],
    additionalProperties: false,
    properties: {
      datetime: isStart ? {
        type: 'string',
        format: 'date-time',
        cast: 'date',
        maxLength: 26,
        formatMaximum: { $data: '2/end/datetime' },
        formatExclusiveMaximum: true,
      } : { macro: 'timestamp' },
      lat: { macro: 'lat' },
      lon: { macro: 'lon' },
    },
  };
}

const identitySchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        firstname: { macro: 'varchar' },
        lastname: { macro: 'varchar' },
        email: { macro: 'email' },
        phone: { macro: 'phone' },
        phone_trunc: { macro: 'phonetrunc' },
        operator_user_id: { macro: 'varchar' },
        company: { macro: 'varchar' },
        over_18: { enum: [true, false, null], default: null },
      travel_pass: {
        type: 'object',
        required: ['name', 'user_id'],
        additionalProperties: false,
        properties: {
          name: { macro: 'varchar', enum: ['navigo'] },
          user_id: { macro: 'varchar' },
        },
      },
    },
  };

const passengerSchema = {
    type: 'object',
    required: ['start', 'end', 'distance', 'identity', 'seats', 'contribution'],
    additionalProperties: false,
    properties: {
        start: positionSchema(),
        end: positionSchema(false),
        identity: identitySchema,
        distance: {
          type: 'integer',
          exclusiveMinimum: 0,
          maximum: 1000000,
        },
        seats: {
            type: 'integer',
            default: 1,
            minimum: 1,
            maximum: 8,
          },
        contribution: {
            type: 'integer',
            minimum: 0,
            maximum: 1000000,
          },
    }
};
const driverSchema = {
    type: 'object',
    required: ['start', 'end', 'distance', 'identity', 'revenue'],
    additionalProperties: false,
    properties: {
        start: positionSchema(),
        end: positionSchema(false),
        identity: identitySchema,
        distance: {
          type: 'integer',
          exclusiveMinimum: 0,
          maximum: 1000000,
        },
        revenue: {
            type: 'integer',
            minimum: 0,
            maximum: 1000000,
          },
    }
};

export const alias = 'policy.simulateOnFuture';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['journey_id', 'operator_id', 'operator_class'],
  anyOf: [{ required: ['passenger'] }, { required: ['driver'] }],
  additionalProperties: false,
  properties: {
    journey_id: { macro: 'varchar' },
    operator_id: { macro: 'serial' },
    operator_class: { enum: ['A', 'B', 'C'] },
    passenger: passengerSchema,
    driver: driverSchema,
  },
};

export const binding = [alias, schema];