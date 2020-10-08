export const company = {
  type: 'object',
  additionalProperties: false,
  properties: {
    siret: { macro: 'siret' },
    naf_etablissement: { macro: 'naf' },
    naf_entreprise: { macro: 'naf' },
    nature_juridique: { macro: 'varchar' },
    rna: { macro: 'rna' },
    vat_intra: { macro: 'euvat' },
  },
};
