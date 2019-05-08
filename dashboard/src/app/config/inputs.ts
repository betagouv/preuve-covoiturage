import { SirenInputBase } from '~/entities/form/sirenInputBase';

import { TextboxBase } from '../entities/form/textBoxBase';

export const INPUTS = {

  address : [

    new TextboxBase({
      key: 'street',
      label: 'Adresse',
      placeholder: 'Remplir l\'adresse',
      value: null,
      required: true,
    }),

    new TextboxBase({
      key: 'postcode',
      label: 'Code Postal',
      placeholder: 'Remplir le code postal',
      value: null,
      required: true,
    }),

    new TextboxBase({
      key: 'city',
      label: 'Ville',
      placeholder: 'Remplir la ville',
      value: null,
      required: true,
    }),

    new TextboxBase({
      key: 'country',
      label: 'Pays',
      placeholder: 'Remplir le pays',
      value: null,
      required: true,
    }),

  ],

  company : [

    new TextboxBase({
      key: 'naf_etablissement',
      label: 'Naf de l\'établissement',
      placeholder: 'Remplir la Naf',
      value: null,
    }),

    new SirenInputBase({
      key: 'siren',
      label: 'Siren',
      placeholder: 'Remplir le SIREN',
      value: null,
    }),

    new TextboxBase({
      key: 'naf_entreprise',
      label: 'Naf de l\'entreprise',
      value: null,
    }),

    new TextboxBase({
      key: 'nature_juridique',
      placeholder: 'Remplir la Naf',
      label: 'Nature Juridique',
      value: null,
    }),

    new TextboxBase({
      key: 'cle_nic',
      label: 'Cle Nic',
      placeholder: 'Remplir la cle NIC',
      value: null,
    }),

    new TextboxBase({
      key: 'rna',
      label: 'RNA',
      placeholder: 'Remplir le RNA',
      value: null,
    }),

    new TextboxBase({
      key: 'vat_intra',
      placeholder: 'Remplir',
      label: 'Vat intra',
      value: null,
    }),


  ],

  contact: [
    new TextboxBase({
      key: 'phone',
      type: 'phone',
      placeholder: 'Remplir',
      label: 'N° de téléphone',
      value: null,
    }),

    new TextboxBase({
      key: 'email',
      label: 'Email',
      placeholder: 'Remplir',
      type: 'email',
      value: null,
    }),
  ],

  bank: [
    new TextboxBase({
      key: 'bank_name',
      type: 'string',
      placeholder: 'Remplir',
      label: 'Nom de la banque',
      value: null,
    }),

    new TextboxBase({
      key: 'client_name',
      type: 'string',
      placeholder: 'Remplir',
      label: 'Nom du client',
      value: null,
    }),

    new TextboxBase({
      key: 'iban',
      type: 'string',
      placeholder: 'Remplir',
      label: 'IBAN',
      value: null,
    }),

    new TextboxBase({
      key: 'bic',
      type: 'string',
      placeholder: 'Remplir',
      label: 'BIC',
      value: null,
    }),
  ],

};

