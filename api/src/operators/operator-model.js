const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OperatorSchema = new Schema({
  nom_commercial: { type: String, required: true },
  raison_sociale: { type: String, required: true },
  siren: { type: String, required: true },
  rna: String,
  vat_intra: String,
  address: {
    street: String,
    city: String,
    country: String,
    postcode: String,
    insee: String,
  },
  contact: {
    email: String,
    phone: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
});

module.exports = mongoose.model("Operator", OperatorSchema);
