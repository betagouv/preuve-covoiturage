import { travelPassSchema } from './travelPassSchema';

export const identitySchema = {
  firstname: { macro: 'varchar' },
  lastname: { macro: 'varchar' },
  email: { macro: 'email' },
  phone: { macro: 'phone' },
  company: { macro: 'varchar' },
  travelPass: travelPassSchema,
};
