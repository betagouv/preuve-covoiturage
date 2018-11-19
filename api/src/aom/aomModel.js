const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AomSchema = new Schema({
  name: { type: String, required: true },
  siren: [{ type: String, required: true }],
  proofs_count: { type: Number, default: 0 },
  proofs_avg_level: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
});

module.exports = mongoose.model("Aom", AomSchema);
