import { identitySchema } from './parts/identitySchema';
import { positionSchema } from './parts/positionSchema';

export const journeyCreateSchema = {
  $id: 'journey.create',
  type: 'object',
  required: ['journey_id', 'operator_class'],
  additionalProperties: false,
  properties: {
    journey_id: {
      type: 'string',
      maxLength: 128,
    },
    operator_journey_id: {
      type: 'string',
      maxLength: 128,
    },
    operator_class: {
      type: 'string',
      maxLength: 1,
      enum: ['A', 'B', 'C', 'Z'],
    },
    passenger: {
      type: 'object',
      required: ['identity', 'start', 'end', 'seats', 'contribution', 'incentives'],
      additionalProperties: false,
      properties: {
        identity: {
          type: 'object',
          required: ['phone'],
          additionalProperties: false,
          properties: {
            ...identitySchema,
            over_18: {
              type: 'boolean',
              default: true,
            },
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
          maximum: 100000,
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
          maximum: 100000,
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
        siren: { macro: 'siren' },
        amount: {
          type: 'number',
          minimum: -200,
          maximum: 200,
        },
      },
    },
  },
};
