import {identitySchema} from './parts/identitySchema';
import {positionSchema} from './parts/positionSchema';


export const tripSchema = {
  $id: 'trip',
  type: 'object',
  required: [], // todo: complete
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
    people: { type: 'array',
      items: { $ref: '#/definitions/person' }
      ,
    },
    // todo: complete
// territory: string[];
// cost ? : number;
// incentive ? : number;
// remaining_fee ? : number;
// revenue ? : number;
//
// validation ? : {
//   step: number;
// validated: boolean;
// validatedAt: Date;
// tests: any;
// rank: string;

createdAt: { macro: 'timestamp' },
    updatedAt: { macro: 'timestamp' },
    deletedAt: { macro: 'timestamp' },
  },
  definitions: {
    person: {
      journey_id: {macro: 'objectid'},
      class: {
        type: 'string',
        enum: [],
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
      is_driver: { type: 'boolean' },
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
    },
  },
};

