import { travelPassSchema } from './travelPassSchema';

export const identitySchema = {
  firstname: { macro: 'varchar' },
  lastname: { macro: 'varchar' },
  email: { macro: 'email' },
  phone: { macro: 'phone' },
  company: { macro: 'varchar' },
  over_18: { enum: [true, false, null], default: null },
  travel_pass: travelPassSchema,
};
