export const bankSchema = {
  type: 'object',
  required: ['bank_name', 'client_name', 'iban', 'bic'],
  additionalProperties: false,
  properties: {
    bank_name: { macro: 'varchar' },
    client_name: { macro: 'varchar' },
    iban: { macro: 'iban' },
    bic: { macro: 'bic' },
  },
};
