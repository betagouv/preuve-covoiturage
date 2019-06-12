export const aomSchema = {
  $id: 'aom',
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {
    name: {
      type: 'string',
    },
    shortname: {
      type: 'string',
      default: '',
    },
    acronym: {
      type: 'string',
      default: '',
      maxlength: 12,
    },
    insee: [
      {
        type: 'string',
        // match: regex.insee,
      },
    ],
    insee_main: {
      type: 'string',
      // match: regex.insee,
    },
    network_id: {
      type: 'numeric',
    },
    company: {
      type: 'object',
      required: ['siren'],
      additionalProperties: false,
      properties: {
        siren: {
          type: 'string',
          // match: regex.siren,
        },
        region: {
          type: 'string',
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
          // match: regex.nic
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
      additionalProperties: false,
      properties: {
        street: {
          type: 'string',
        },
        city: {
          type: 'string',
        },
        country: {
          type: 'string',
        },
        postcode: {
          type: 'string',
          // match: regex.postcode,
        },
        cedex: {
          type: 'string',
          // match: regex.cedex,
        },
      },
    },
    contacts: {
      type: 'object',
      required: [],
      additionalProperties: false,
      properties: {
        phone: {
          type: 'string',
        },
        email: {
          type: 'string',
          // match: regex.email,
        },
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
          type: 'string', // ObjectId
        },
      },
    },
    geometry: {
      type: 'object',
      required: [],
      additionalProperties: false,
      properties: {
        type: {
          type: 'string',
          default: 'MultiPolygon',
        },
        coordinates: {
          type: 'array',
        },
      },
    },
    deletedAt: {
      type: 'string',
      format: 'datetime',
    },
  },
};

// AomSchema.index({ geometry: '2dsphere' });
//   },
// };
