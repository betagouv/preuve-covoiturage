import { driverSchema, passengerSchema, timeGeoPointSchema } from '../acquisition/common/schemas/createJourneySchemaV3';

function positionSchema(isStart = true) {
  return {
    type: 'object',
    required: ['datetime', 'lat', 'lon'],
    additionalProperties: false,
    properties: {
      datetime: isStart
        ? {
            type: 'string',
            format: 'date-time',
            cast: 'date',
            maxLength: 26,
            formatExclusiveMaximum: { $data: '2/end/datetime' },
          }
        : { macro: 'timestamp' },
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

const passengerSchemaV2 = {
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
  },
};
const driverSchemaV2 = {
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
  },
};

export const aliasv2 = 'policy.simulateOnFuture.v2';
export const schemav2 = {
  $id: aliasv2,
  type: 'object',
  required: ['api_version', 'journey_id', 'operator_id', 'operator_class'],
  anyOf: [{ required: ['passenger'] }, { required: ['driver'] }],
  additionalProperties: false,
  properties: {
    api_version: { const: 'v2' },
    journey_id: { macro: 'varchar' },
    operator_id: { macro: 'serial' },
    operator_class: { enum: ['A', 'B', 'C'] },
    passenger: passengerSchemaV2,
    driver: driverSchemaV2,
  },
};

export const aliasv3 = 'policy.simulateOnFuture.v3';
export const schemav3 = {
  $id: aliasv3,
  type: 'object',
  required: ['api_version', 'operator_id', 'operator_class', 'start', 'end', 'passenger', 'driver'],
  additionalProperties: false,
  properties: {
    api_version: { const: 'v3' },
    operator_id: { macro: 'serial' },
    operator_class: { enum: ['A', 'B', 'C'] },
    start: timeGeoPointSchema,
    end: timeGeoPointSchema,
    passenger: passengerSchema,
    driver: driverSchema,
  },
};

export const alias = 'policy.simulateOnFuture';
export const schema = {
  $id: alias,
  anyOf: [schemav2, schemav3],
};
export const binding = [alias, schema];
