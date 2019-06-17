export const aomSchema = {
  $id: 'operator',
  type: 'object',
  required: ['nom_commercial', 'raison_sociale'],
  additionalProperties: false,
  properties: {
    nom_commercial: {
      type: 'string',
      minLength: 3,
      maxLength: 256,
    },
    raison_sociale: {
      type: 'string',
      minLength: 3,
      maxLength: 256,
    },
    company: {
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
    },
    address: {
      type: 'object',
      required: ['street', 'city', 'country', 'postcode'],
      additionalProperties: false,
      properties: {
        street: {
          type: 'string',
          minLength: 3,
          maxLength: 512,
        },
        city: {
          type: 'string',
          minLength: 1,
          maxLength: 256,
        },
        country: {
          type: 'string',
          minLength: 3,
          maxLength: 256,
        },
        postcode: {
          type: 'string',
          format: 'postcode',
        },
        cedex: {
          type: 'string',
          minLength: 3,
          maxLength: 256,
        },
      },
    },
    bank: {
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
    },
    contacts: {
      type: 'object',
      additionalProperties: false,
      properties: {
        rgpd_dpo: {
          type: 'string',
          format: 'objectid',
        },
        rgpd_controller: {
          type: 'string',
          format: 'objectid',
        },
        technical: {
          type: 'string',
          format: 'objectid',
        },
      },
    },
    cgu: {
      type: 'object',
      additionalProperties: false,
      properties: {
        accepted: {
          type: 'boolean',
          default: false,
        },
        acceptedAt: {
          type: 'string',
          format: 'datetime',
        },
        acceptedBy: {
          type: 'string',
          format: 'objectid',
        },
      },
    },
    applications: {
      type: 'array',
      items: {
        // [ApplicationSchema]
      },
    },
    createdAt: {
      type: 'string',
      format: 'datetime',
    },
    updatedAt: {
      type: 'string',
      format: 'datetime',
    },
    deletedAt: {
      type: 'string',
      format: 'datetime',
    },
  },
};
