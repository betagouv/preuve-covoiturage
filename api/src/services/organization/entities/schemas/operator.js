const mongoose = require('mongoose');
const { regex, setters, validators } = require('../../shared/packages/mongo/schema-validation');
const ApplicationSchema = require('./application');

const { Schema } = mongoose;

const OperatorSchema = new Schema({
  nom_commercial: { type: String, trim: true, required: true, alias: 'name' },
  raison_sociale: { type: String, trim: true, required: true },
  company: {
    siren: { type: String, match: regex.siren, required: true },
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
  bank: {
    bank_name: { type: String, trim: true },
    client_name: { type: String, trim: true },
    iban: { type: String, trim: true, validate: validators.iban, set: setters.iban },
    bic: { type: String, trim: true, uppercase: true, validate: validators.bic, set: setters.bic },
  },
  contacts: {
    rgpd_dpo: Schema.Types.ObjectId,
    rgpd_controller: Schema.Types.ObjectId,
    technical: Schema.Types.ObjectId,
  },
  cgu: {
    accepted: { type: Boolean, default: false },
    acceptedAt: Date,
    acceptedBy: Schema.Types.ObjectId,
  },
  applications: [ApplicationSchema],

  deletedAt: { type: Date },
}, { timestamps: true, id: false });

module.exports = OperatorSchema;
