const mongoose = require('mongoose');
const OperatorSchema = require('../database/schemas/operator');
const AomSchema = require('../database/schemas/aom');
const ClassSchema = require('../database/schemas/class');
const { ProofSchema } = require('../proofs/proof-model');

const { Schema } = mongoose;

const JourneySchema = new Schema({
  journey_id: { type: String, index: true },

  driver: [ProofSchema],
  passengers: [ProofSchema],
  proofs: [ProofSchema],

  passengers_count: { type: Number, default: 0 },

  validation: {
    step: { type: Number, default: 0 },
    validated: { type: Boolean, default: false },
    validatedAt: { type: Date, default: null },
    tests: { type: Schema.Types.Mixed, default: {} },
    class: ClassSchema,
  },

  // system's data about the operator
  operator: OperatorSchema,

  // system's data about the aom
  aom: [AomSchema],

  deletedAt: { type: Date, default: null },

}, { timestamps: true });

JourneySchema.method('addProof', async function (proof) {
  this.proofs.push(proof);
  await this.save();

  return this;
});

module.exports = mongoose.model('Journey', JourneySchema);
// module.exports.JourneySchema = JourneySchema;
