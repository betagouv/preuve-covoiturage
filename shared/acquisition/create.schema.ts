import { passengerSchema, driverSchema } from './common/schemas/person';

export const alias = 'journey.create';
export const create = {
  $id: alias,
  type: 'object',
  required: ['driver', 'passenger', 'journey_id', 'operator_class'],
  additionalProperties: false,
  properties: {
    journey_id: { macro: 'varchar' },
    operator_id: { macro: 'serial' },
    operator_journey_id: { macro: 'varchar' },
    operator_class: { enum: ['A', 'B', 'C'] },
    passenger: passengerSchema,
    driver: driverSchema,
  },
};
