import { passengerSchema, driverSchema } from './common/schemas/person';

export const alias = 'journey.create';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['journey_id', 'operator_class'],
  anyOf: [{ required: ['passenger'] }, { required: ['driver'] }],
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

export const binding = [alias, schema];
