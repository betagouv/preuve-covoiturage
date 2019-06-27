import { identitySchema } from './parts/identitySchema';
import { positionSchema } from './parts/positionSchema';

export const journeyCreateSchema = {
  $id: 'journey.create',
  type: 'object',
  required: ['journey_id', 'operator_class', 'operator_id'],
  anyOf: [{ required: ['passenger'] }, { required: ['driver'] }],
  additionalProperties: false,
  properties: {
    journey_id: { macro: 'varchar' },
    operator_journey_id: { macro: 'varchar' },
    operator_class: { enum: ['A', 'B', 'C'] },
    operator_id: { macro: 'objectid' },
    passenger: {
      type: 'object',
      required: ['identity', 'start', 'end', 'contribution', 'incentives'],
      additionalProperties: false,
      properties: {
        identity: {
          type: 'object',
          required: ['phone'],
          additionalProperties: false,
          properties: {
            ...identitySchema,
            over_18: { enum: [true, false, null], default: null },
          },
        },
        start: positionSchema,
        end: positionSchema,
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
          items: { $ref: '#/definitions/incentive' },
        },
        distance: {
          type: 'integer',
          minimum: 0,
          maximum: 1000000,
        },
        duration: {
          type: 'integer',
          minimum: 0,
          maximum: 86400,
        },
      },
    },
    driver: {
      type: 'object',
      required: ['identity', 'start', 'end', 'revenue', 'incentives'],
      additionalProperties: false,
      properties: {
        identity: {
          type: 'object',
          required: ['phone'],
          additionalProperties: false,
          properties: {
            ...identitySchema,
          },
        },
        start: positionSchema,
        end: positionSchema,
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
          items: { $ref: '#/definitions/incentive' },
        },
        distance: {
          type: 'integer',
          minimum: 0,
          maximum: 1000000,
        },
        duration: {
          type: 'integer',
          minimum: 0,
          maximum: 86400,
        },
      },
    },
  },
  definitions: {
    incentive: {
      type: 'object',
      additionalProperties: false,
      minProperties: 3,
      properties: {
        index: {
          type: 'integer',
          minimum: 0,
        },
        siret: { macro: 'siret' },
        amount: {
          type: 'number',
          minimum: -200,
          maximum: 200,
        },
      },
    },
  },
};
