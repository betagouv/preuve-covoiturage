import {identitySchema} from './parts/identitySchema';
import {positionSchema} from './parts/positionSchema';
import {validationSchema} from './parts/validationSchema';


export const tripSchema = {
  $id: 'trip',
  type: 'object',
  required: ['operator_id', 'people'],
  additionalProperties: false,
  properties: {
    operator_id: { macro: 'objectid' },
    operator_journey_id: { macro: 'objectid' },
    territory: {
      type: 'array',
      items: { macro: 'objectid' },
    },
    status: {
      type: 'string',
      enum: ['pending', 'active', 'error'],
      default: 'pending',
    },
    start: { marco: 'position' },
    people: {
      type: 'array',
      items: { $ref: '#/definitions/person' },
    },
    incentives: {
      type: 'array',
      items: { $ref: '#/definitions/incentive' },
    },
    createdAt: { macro: 'timestamp' },
    updatedAt: { macro: 'timestamp' },
    deletedAt: { macro: 'timestamp' },
  },
  definitions: {
    person: {
      type: 'object',
      additionalProperties: false,
      required: ['journey_id', 'identity', 'is_driver', 'start', 'end', 'cost', 'expense', 'operator_class', 'operator'],
      properties: {
        journey_id: {macro: 'objectid'},
        class: {
          type: 'string',
          maxLength: 1,
          enum: ['A', 'B', 'C', 'Z'],
        },
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
        is_driver: {type: 'boolean'},
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
        revenue: {
          type: 'integer',
          minimum: 0,
          maximum: 1000000,
        },
        cost: {
          type: 'integer',
          minimum: 0,
          maximum: 1000000,
        },
        remaining_fee: {
          type: 'integer',
          minimum: 0,
          maximum: 1000000,
        },
        incentives: {
          type: 'array',
          minItems: 0,
          items: {$ref: '#/definitions/incentive'},
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
        operator_class: {
          type: 'string',
          maxLength: 1,
          enum: ['A', 'B', 'C', 'Z'],
        },
        operator: {
          type: 'object',
          properties: {
            _id: {macro: 'objectid'},
            name: {macro: 'varchar'},
          },
        },
        validation: validationSchema,
      },
    },
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

