export const alias = 'journey.cancel';
export const cancel = {
  $id: alias,
  anyOf: [
    {
      type: 'object',
      required: ['api_version', 'operator_journey_id', 'code'],
      additionalProperties: false,
      properties: {
        api_version: { const: 'v3' },
        operator_journey_id: { macro: 'varchar' },
        code: {
          type: 'string',
          pattern: '^[0-9A-Za-z_-]{0,32}$',
          maxLength: 32,
        },
        message: {
          type: 'string',
          maxLength: 512,
        },
      },
    },
  ],
};

export const binding = [alias, cancel];
