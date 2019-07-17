import { incentiveSchema } from '../../incentive';
import { positionSchema } from '../../position';
import { identitySchema } from '../../identity';
import { paymentSchema } from '../../payment';

export const passengerSchema = {
  type: 'object',
  required: ['identity', 'start', 'end', 'contribution', 'incentives'],
  additionalProperties: false,
  properties: {
    identity: identitySchema,
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
      items: incentiveSchema,
    },
    payments: {
      type: 'array',
      minItems: 0,
      items: paymentSchema,
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
};
