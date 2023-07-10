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
export const schema = schemav3;
export const binding = [alias, schema];
