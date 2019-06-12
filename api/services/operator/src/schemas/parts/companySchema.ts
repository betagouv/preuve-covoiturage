export const companySchema = {
  type: 'object',
  required: ['siren'],
  additionalProperties: false,
  properties: {
    siren: {
      type: 'string',
      // match: regex.siren,
    },
    naf_etablissement: {
      type: 'string',
      // match: regex.naf,
    },
    naf_entreprise: {
      type: 'string',
      // match: regex.naf,
    },
    nature_juridique: {
      type: 'string',
    },
    cle_nic: {
      type: 'string',
      // match: regex.nic,
    },
    rna: {
      type: 'string',
    },
    vat_intra: {
      type: 'string',
      // match: regex.vatIntra
    },
  },
};
