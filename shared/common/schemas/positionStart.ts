import { position } from './position';

// deep copy start schema to avoid side effects
const schema = JSON.parse(JSON.stringify(position));

// make start date depstartent of start date
// requires Ajv option { $data: true }
schema.properties.datetime = {
  type: 'string',
  format: 'date-time',
  cast: 'date',
  maxLength: 26,
  formatMaximum: { $data: '2/end/datetime' },
  formatExclusiveMaximum: true,
};

export { schema };
