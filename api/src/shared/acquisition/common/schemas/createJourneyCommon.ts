import { payment } from '../../../common/schemas/payment.ts';

export const distanceSchema = {
  type: 'integer',
  exclusiveMinimum: 0,
  maximum: 1000000,
};

export const paymentsSchema = {
  type: 'array',
  minItems: 0,
  maxItems: 20,
  items: payment,
};

export const revenueSchema = {
  type: 'integer',
  minimum: 0,
  maximum: 1000000,
};
export { revenueSchema as contributionSchema };

export const incentiveSchema = {
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

export const incentivesSchema = {
  type: 'array',
  minItems: 0,
  maxItems: 20,
  items: incentiveSchema,
};

export const seatSchema = {
  type: 'integer',
  default: 1,
  minimum: 1,
  maximum: 8,
};

export const travelPassSchema = {
  type: 'object',
  minProperties: 2,
  additionalProperties: false,
  properties: {
    name: { macro: 'varchar', enum: ['navigo'] },
    user_id: { macro: 'varchar' },
  },
};

export const identityPropsSchema = {
  firstname: { macro: 'varchar' },
  lastname: { macro: 'varchar' },
  email: { macro: 'email' },
  phone: { macro: 'phone' },
  phone_trunc: { macro: 'phonetrunc' },
  operator_user_id: { macro: 'varchar' },
  company: { macro: 'varchar' },
  over_18: { enum: [true, false, null], default: null },
  travel_pass: travelPassSchema,
};
