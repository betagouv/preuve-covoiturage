export const aomSchema = {
  '$id': 'operator',
  type: 'object',
  required: ['nom_commercial', 'raison_sociale'],
  additionnalProperties: false,
  properties: {
    nom_commercial: {
      type: 'string',
    },
    raison_sociale: {
      type: 'string',
    },
    company: {
      type: 'object',
      required: ['siren'],
      additionnalProperties: false,
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
          type: 'string'
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
    },
    address: {
      type: 'object',
      required: [],
      additionnalProperties: false,
      properties: {
        street: {
          type: 'string'
        },
        city: {
          type: 'string'
        },
        country: {
          type: 'string'
        },
        postcode: {
          type: 'string', 
          // match: regex.postcode,
        },
        cedex: {
          type: 'string',
          // match: regex.cedex
        },
      },
    },
    bank: {
      type: 'object',
      required: [],
      additionnalProperties: false,
      properties: {
        bank_name: {
          type: 'string'
        },
        client_name: {
          type: 'string'
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
    },
    contacts: {
      type: 'object',
      required: [],
      additionnalProperties: false,
      properties: {
        rgpd_dpo: {
          type: 'string', // ObjectId
        },
        rgpd_controller: {
          type: 'string', // ObjectId
        },
        technical: {
          type: 'string', // ObjectId
        },
      },
    },
    cgu: {
      type: 'object',
      required: [],
      additionnalProperties: false,
      properties: {
        accepted: {
          type: 'boolean', 
          default: false
        },
        acceptedAt: {
          type: 'string',
          format: 'datetime',
        },
        acceptedBy: {
          type: 'string', // ObjectId
        },
      },
    },
    applications: {
      type: 'array',
      items: {
        // [ApplicationSchema]
      }
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
