/* eslint-disable no-useless-escape */
const mongoose = require('mongoose');
const { regex } = require('../../packages/mongo/schema-validation');

const { Schema } = mongoose;

const AomSchema = new Schema({
  name: { type: String, trim: true, required: true },
  shortname: { type: String, trim: true, default: '' },
  acronym: {
    type: String,
    trim: true,
    default: '',
    uppercase: true,
    maxlength: 12,
  },
  insee: [{
    type: String,
    trim: true,
    uppercase: true,
    match: regex.insee,
  }],
  insee_main: {
    type: String,
    trim: true,
    uppercase: true,
    match: regex.insee,
  },
  network_id: Number,
  company: {
    siren: { type: String, match: regex.siren, required: true },
    region: { type: String, trim: true },
    naf_etablissement: { type: String, match: regex.naf, trim: true },
    naf_entreprise: { type: String, match: regex.naf, trim: true },
    nature_juridique: { type: String, trim: true },
    cle_nic: { type: String, match: regex.nic, trim: true },
    rna: { type: String, trim: true },
    vat_intra: { type: String, match: regex.vatIntra, trim: true },
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    country: { type: String, trim: true },
    postcode: { type: String, match: regex.postcode, trim: true, uppercase: true },
    cedex: { type: String, match: regex.cedex, trim: true },
  },
  contacts: {
    phone: { type: String, trim: true },
    email: { type: String, match: regex.email, trim: true, lowercase: true },
    rgpd_dpo: Schema.Types.ObjectId,
    rgpd_controller: Schema.Types.ObjectId,
    technical: Schema.Types.ObjectId,
  },
  cgu: {
    accepted: { type: Boolean, default: false },
    acceptedAt: Date,
    acceptedBy: Schema.Types.ObjectId,
  },
  geometry: {
    type: {
      type: String,
      default: 'MultiPolygon',
    },
    coordinates: {
      type: Array,
      default: undefined,
    },
  },
  deletedAt: { type: Date },
}, { timestamps: true, id: false });

AomSchema.index({ geometry: '2dsphere' });

module.exports = AomSchema;
