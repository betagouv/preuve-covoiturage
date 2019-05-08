export const OPERATOR_HEADERS = {

  tokens: {
    main: [
      'name',
      'createdAt',
    ],
  },
  operators: {
    main: [
      '_id',
      'nom_commercial',
      'raison_sociale',
      'company.siren',
      'company.naf_etablissement',
      'company.naf_entreprise',
      'company.nature_juridique',
      'company.cle_nic',
      'company.rna',
      'company.vat_intra',
      'address.street',
      'address.postcode',
      'address.city',
      'address.country',
      'bank.bank_name',
      'bank.client_name',
      'bank.iban',
      'bank.bic',
    ],
    selection: [
      'nom_commercial',
      'raison_sociale',
    ],

  },


};
