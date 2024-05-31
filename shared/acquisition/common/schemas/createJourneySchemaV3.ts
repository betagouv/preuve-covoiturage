import {
  contributionSchema,
  distanceSchema,
  identityPropsSchema,
  incentivesSchema,
  paymentsSchema,
  seatSchema,
} from './createJourneyCommon.ts';

export const timeGeoPointSchema = {
  type: 'object',
  minProperties: 3,
  additionalProperties: false,
  properties: {
    datetime: { macro: 'timestamp' },
    lat: { macro: 'lat' },
    lon: { macro: 'lon' },
  },
};

export const incentiveCounterpartSchema = {
  type: 'object',
  additionalProperties: false,
  minProperties: 3,
  properties: {
    target: {
      type: 'string',
      enum: ['passenger', 'driver'],
    },
    siret: { macro: 'siret' },
    amount: {
      type: 'number',
      minimum: 0,
      maximum: 100000,
    },
  },
};

const identitySchema = {
  type: 'object',
  required: ['operator_user_id', 'identity_key'],
  additionalProperties: false,
  properties: {
    identity_key: { pattern: '^[a-f0-9]{64}$', maxLength: 64 },
    ...identityPropsSchema,
  },
};

export const driverSchema = {
  type: 'object',
  required: ['identity', 'revenue'],
  additionalProperties: false,
  properties: {
    identity: identitySchema,
    revenue: {
      type: 'integer',
      minimum: 0,
      maximum: 1000000,
    },
  },
};

export const passengerSchema = {
  type: 'object',
  required: ['identity', 'contribution'],
  additionalProperties: false,
  properties: {
    identity: identitySchema,
    contribution: contributionSchema,
    payments: paymentsSchema,
    seats: seatSchema,
  },
};

export const createJourneySchemaV3 = {
  type: 'object',
  required: ['operator_journey_id', 'operator_class', 'incentives', 'start', 'end', 'distance', 'driver', 'passenger'],
  additionalProperties: false,
  properties: {
    operator_id: { macro: 'serial' },
    operator_journey_id: { macro: 'varchar' },
    operator_trip_id: { macro: 'varchar' },
    operator_class: { enum: ['A', 'B', 'C'] },
    start: timeGeoPointSchema,
    end: timeGeoPointSchema,
    driver: driverSchema,
    passenger: passengerSchema,
    distance: distanceSchema,
    licence_plate: { macro: 'varchar' },
    incentives: incentivesSchema,
    incentive_counterparts: {},
  },
};
