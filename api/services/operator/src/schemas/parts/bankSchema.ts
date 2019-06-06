export const bankSchema = {
  type: 'object',
  required: [],
  additionalProperties: false,
  properties: {
    bank_name: {
      type: 'string',
    },
    client_name: {
      type: 'string',
    },
    iban: {
      type: 'string',
      // validate: validators.iban,
      // set: setters.iban
    },
    bic: {
      type: 'string',
      // validate: validators.bic,
      // set: setters.bic
    },
  },
};
