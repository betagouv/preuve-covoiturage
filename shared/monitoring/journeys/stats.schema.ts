export const alias = 'monitoring.journeys.stats';
export const schema = {
  type: 'integer',
  minimum: 1,
  maximum: 30,
  default: 15,
};

export const binding = [alias, schema];
