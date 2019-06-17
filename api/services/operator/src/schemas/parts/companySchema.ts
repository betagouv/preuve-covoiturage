export const companySchema = {
  type: 'object',
  required: ['siren'],
  additionalProperties: false,
  properties: {
    siren: {
      type: 'string',
      format: 'siren',
      minLength: 9,
      maxLength: 9,
    },
    naf_etablissement: {
      type: 'string',
      format: 'naf',
      minLength: 5,
      maxLength: 5,
    },
    naf_entreprise: {
      type: 'string',
      format: 'naf',
      minLength: 5,
      maxLength: 5,
    },
    nature_juridique: {
      type: 'string',
      minLength: 2,
      maxLength: 256,
    },
    cle_nic: {
      type: 'string',
      format: 'nic',
      minLength: 5,
      maxLength: 5,
    },
    rna: {
      type: 'string',
      format: 'rna',
    },
    vat_intra: {
      type: 'string',
      format: 'euvat',
      minLength: 13,
      maxLength: 13,
    },
  },
};
