import { positionSchema } from './positionSchema';

// deep copy start schema to avoid side effects
const startSchema = JSON.parse(JSON.stringify(positionSchema));

// make start date depstartent of start date
// requires Ajv option { $data: true }
startSchema.properties.datetime = {
  type: 'string',
  format: 'date-time',
  cast: 'date',
  maxLength: 26,
  formatMaximum: { $data: '2/end/datetime' },
  formatExclusiveMaximum: true,
};

export { startSchema };
