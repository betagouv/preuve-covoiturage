import { travelPass } from './travelPass';

export const identity = {
  type: 'object',
  required: ['phone'],
  additionalProperties: false,
  properties: {
    firstname: { macro: 'varchar' },
    lastname: { macro: 'varchar' },
    email: { macro: 'email' },
    phone: { macro: 'phone' },
    company: { macro: 'varchar' },
    over_18: { enum: [true, false, null], default: null },
    travel_pass: travelPass,
  },
};
