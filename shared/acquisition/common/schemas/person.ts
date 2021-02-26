import { payment } from '../../../common/schemas/payment';
import { position as positionSchema } from '../../../common/schemas/position';

const incentiveSchema = {
  type: 'object',
  additionalProperties: false,
  minProperties: 3,
  properties: {
    index: {
      type: 'integer',
      minimum: 0,
      maximum: 19,
    },
    siret: { macro: 'siret' },
    amount: {
      type: 'number',
      minimum: 0,
      maximum: 100000,
    },
  },
};

const endSchema = JSON.parse(JSON.stringify(positionSchema));

// deep copy start schema to avoid side effects
const startSchema = JSON.parse(JSON.stringify(positionSchema));

// make start date depstartent of start date
// requires Ajv option { $data: true }
startSchema.properties.datetime = {
  type: 'string',
  format: 'date-time',
  cast: 'date',
  maxLength: 26,
  formatExclusiveMaximum: { $data: '2/end/datetime' },
};

const travelPassSchema = {
  type: 'object',
  minProperties: 2,
  additionalProperties: false,
  properties: {
    name: { macro: 'varchar', enum: ['navigo'] },
    user_id: { macro: 'varchar' },
  },
};

const identitySchema = {
  type: 'object',
  anyOf: [{ required: ['phone'] }, { required: ['operator_user_id', 'phone_trunc'] }],
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
    travel_pass: travelPassSchema,
  },
};

export const driverSchema = {
  type: 'object',
  required: ['identity', 'start', 'end', 'revenue', 'incentives'],
  additionalProperties: false,
  properties: {
    identity: identitySchema,
    start: startSchema,
    end: endSchema,
    expense: {
      type: 'integer',
      minimum: 0,
      maximum: 1000000,
    },
    revenue: {
      type: 'integer',
      minimum: 0,
      maximum: 1000000,
    },
    incentives: {
      type: 'array',
      minItems: 0,
      maxItems: 20,
      items: incentiveSchema,
    },
    payments: {
      type: 'array',
      minItems: 0,
      maxItems: 20,
      items: payment,
    },
    distance: {
      type: 'integer',
      exclusiveMinimum: 0,
      maximum: 1000000,
    },
    duration: {
      type: 'integer',
      exclusiveMinimum: 0,
      maximum: 86400,
    },
  },
};

export const passengerSchema = {
  type: 'object',
  required: ['identity', 'start', 'end', 'contribution', 'incentives'],
  additionalProperties: false,
  properties: {
    identity: identitySchema,
    start: startSchema,
    end: endSchema,
    seats: {
      type: 'integer',
      default: 1,
      minimum: 1,
      maximum: 8,
    },
    expense: {
      type: 'integer',
      minimum: 0,
      maximum: 1000000,
    },
    contribution: {
      type: 'integer',
      minimum: 0,
      maximum: 1000000,
    },
    incentives: {
      type: 'array',
      minItems: 0,
      items: incentiveSchema,
    },
    payments: {
      type: 'array',
      minItems: 0,
      maxItems: 20,
      items: payment,
    },
    distance: {
      type: 'integer',
      exclusiveMinimum: 0,
      maximum: 1000000,
    },
    duration: {
      type: 'integer',
      exclusiveMinimum: 0,
      maximum: 86400,
    },
  },
};
