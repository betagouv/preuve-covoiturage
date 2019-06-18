export const territorySchema = {
  $id: 'territory',
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {
    name: { macro: 'varchar' },
    shortname: { macro: 'varchar' },
    acronym: { macro: 'varchar' },
    insee: [{ macro: 'insee' }],
    insee_main: { macro: 'insee' },
    network_id: { type: 'integer' },
    company: {
      type: 'object',
      required: ['siren'],
      additionalProperties: false,
      properties: {
        siren: { macro: 'siren' },
        region: { macro: 'varchar' },
        naf_etablissement: { macro: 'naf' },
        naf_entreprise: { macro: 'naf' },
        nature_juridique: { macro: 'varchar' },
        cle_nic: { macro: 'nic' },
        rna: { macro: 'rna' },
        vat_intra: { macro: 'euvat' },
      },
    },
    address: {
      type: 'object',
      required: [],
      additionalProperties: false,
      properties: {
        street: { macro: 'varchar' },
        city: { macro: 'varchar' },
        country: { macro: 'varchar' },
        postcode: { macro: 'postcode' },
        cedex: { macro: 'varchar' },
      },
    },
    contacts: {
      type: 'object',
      required: [],
      additionalProperties: false,
      properties: {
        phone: { macro: 'phone' },
        email: { macro: 'email' },
        rgpd_dpo: { macro: 'objectid' },
        rgpd_controller: { macro: 'objectid' },
        technical: { macro: 'objectid' },
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
        acceptedAt: { macro: 'timestamp' },
        acceptedBy: { macro: 'objectid' },
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
    deletedAt: { macro: 'timestamp' },
  },
};
