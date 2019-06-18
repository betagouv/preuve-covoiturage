export const companySchema = {
  type: 'object',
  required: ['siren'],
  additionalProperties: false,
  properties: {
    siren: { macro: 'siren' },
    naf_etablissement: { macro: 'naf' },
    naf_entreprise: { macro: 'naf' },
    nature_juridique: { macro: 'varchar' },
    cle_nic: { macro: 'nic' },
    rna: { macro: 'rna' },
    vat_intra: { macro: 'euvat' },
  },
};
