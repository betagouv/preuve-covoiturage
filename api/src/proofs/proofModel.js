const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProofSchema = new Schema({
  raw: { type: String },
  validated: { type: Boolean, default: false },
  lastConnectedAt: { type: Date },
  operator: {
    type: Object,
  }
});

module.exports = mongoose.model("Proof", ProofSchema);
