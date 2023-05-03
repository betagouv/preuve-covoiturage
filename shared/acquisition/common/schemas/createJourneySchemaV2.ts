import { position as positionSchema } from '../../../common/schemas/position';
import {
  contributionSchema,
  distanceSchema,
  identityPropsSchema,
  incentivesScema,
  paymentsSchema,
  revenueSchema,
  seatSchema,
} from './createJourneyCommon';

const endSchema = JSON.parse(JSON.stringify(positionSchema));

// deep copy start schema to avoid side effects
const startSchema = JSON.parse(JSON.stringify(positionSchema));

// make start date depstartent of start date
// requires Ajv option { $data: true }
startSchema.properties.datetime = {
  type: 'string',
  format: 'date-time',
  cast: 'date',
  maxLength: 64,
  formatExclusiveMaximum: { $data: '2/end/datetime' },
};

const identitySchema = {
  type: 'object',
  anyOf: [{ required: ['phone'] }, { required: ['operator_user_id', 'phone_trunc'] }],
  additionalProperties: false,
  properties: identityPropsSchema,
};

const driverSchema = {
  type: 'object',
  required: ['identity', 'start', 'end', 'revenue', 'incentives'],
  additionalProperties: false,
  properties: {
    identity: identitySchema,
    start: startSchema,
    end: endSchema,
    revenue: revenueSchema,
    incentives: incentivesScema,
    payments: paymentsSchema,
    distance: distanceSchema,
    duration: {
      type: 'integer',
      exclusiveMinimum: 0,
      maximum: 86400,
    },
  },
};

const passengerSchema = {
  type: 'object',
  required: ['identity', 'start', 'end', 'contribution', 'incentives'],
  additionalProperties: false,
  properties: {
    identity: identitySchema,
    start: startSchema,
    end: endSchema,
    seats: seatSchema,
    contribution: contributionSchema,
    incentives: incentivesScema,
    payments: paymentsSchema,
    distance: distanceSchema,
    duration: {
      type: 'integer',
      exclusiveMinimum: 0,
      maximum: 86400,
    },
  },
};

export const createJourneySchemaV2 = {
  type: 'object',
  required: ['driver', 'passenger', 'journey_id', 'operator_class'],
  additionalProperties: false,
  properties: {
    operator_id: { macro: 'serial' },
    journey_id: { macro: 'varchar' },
    operator_journey_id: { macro: 'varchar' },
    operator_class: { enum: ['A', 'B', 'C'] },
    passenger: passengerSchema,
    driver: driverSchema,
  },
};
