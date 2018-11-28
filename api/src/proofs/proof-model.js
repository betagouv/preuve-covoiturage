const mongoose = require('mongoose');
const OperatorSchema = require('../database/schemas/operator');
const PositionSchema = require('../database/schemas/position');
const AomSchema = require('../database/schemas/aom');
const ClassSchema = require('../database/schemas/class');

const { Schema } = mongoose;

const ProofSchema = new Schema({
  // operator's data
  traveler_hash: {
    type: String,
    required: [true, 'A traveler hash is required, please see: https://github.com/betagouv/preuve-covoiturage/wiki/Hashage-des-donn%C3%A9es-utilisateurs'],
  },
  journey_id: { type: String },
  operator_id: {
    type: String,
    required: [true, 'An operator ID is required, please see: https://github.com/betagouv/preuve-covoiturage/wiki/Op%C3%A9rateurs-de-covoiturage'],
  },
  is_driver: { type: Boolean },
  passengers_count: { type: Number, default: 0 },
  start: PositionSchema,
  end: PositionSchema,
  distance: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  trust_level: { type: Number, default: 0 },

  // system's data
  validation: {
    validated: { type: Boolean, default: false },
    validatedAt: { type: Date, default: null },
    class: ClassSchema,
  },

  // set by timestamps: true
  // createdAt: { type: Date, default: Date.now() },
  // updatedAt: { type: Date, default: Date.now() },
  deletedAt: { type: Date, default: null },

  // system's data about the operator
  operator: OperatorSchema,

  // system's data about the aom
  aom: [AomSchema],

}, { timestamps: true });

ProofSchema.method('toJSON', function toJSON() {
  const proof = this.toObject();
  proof._id = `${proof._id}`;
  delete proof.__v;

  return proof;
});

module.exports = mongoose.model('Proof', ProofSchema);
module.exports.ProofSchema = ProofSchema;
