export const bankSchema = {
  type: 'object',
  required: ['bank_name', 'client_name', 'iban', 'bic'],
  additionalProperties: false,
  properties: {
    bank_name: {
      type: 'string',
      minLength: 3,
      maxLength: 256,
    },
    client_name: {
      type: 'string',
      minLength: 3,
      maxLength: 256,
    },
    iban: {
      type: 'string',
      format: 'iban',
      minLength: 18,
      maxLength: 18,
    },
    bic: {
      type: 'string',
      format: 'bic',
      minLength: 8,
      maxLength: 11,
    },
  },
};
