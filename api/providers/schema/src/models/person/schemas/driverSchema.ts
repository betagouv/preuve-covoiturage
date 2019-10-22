import { incentiveSchema } from '../../incentive';
import { startSchema, endSchema } from '../../position';
import { identitySchema } from '../../identity';
import { paymentSchema } from '../../payment';

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
