export const alias = 'journey.list';
export const list = {
  $id: alias,
  type: 'object',
  required: ['status'],
  additionalProperties: false,
  properties: {
    status: {
      type: 'string',
      enum: [
        'acquisition_error',
        'validation_error',
        'normalization_error',
        'fraud_error',
        'ok',
        'expired',
        'canceled',
        'pending',
      ],
    },
    limit: {
      type: 'integer',
      min: 0,
      max: 100,
    },
    offset: {
      type: 'integer',
      min: 0,
    },
    start: {
      macro: 'timestamp',
    },
    end: {
      macro: 'timestamp',
    },
  },
};

export const binding = [alias, list];
