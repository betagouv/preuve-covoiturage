const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * start and end positions schemas
 */
const PositionSchema = new Schema({
  lat: Number,
  lng: Number,
  date: Date,
  insee: String,
  literal: String,
});

/**
 * Local operator schema
 */
const OperatorSchema = new Schema({
  operator_id: Schema.Types.ObjectId,
  name: String,
  siren: String,
});

/**
 * Local AOM schema
 */
const AomSchema = new Schema({
  aom_id: Schema.Types.ObjectId,
  name: String,
  siren: String,
  journey_span: {
    type: Number,
    min: 0,
    max: 100,
  },
});

/**
 * Proof schema
 */
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
  id_driver: { type: Boolean },
  passengers_count: { type: Number, default: 0 },
  start: PositionSchema,
  end: PositionSchema,
  distance: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  trust_level: { type: Number, default: 0 },

  // system's data
  validated: { type: Boolean, default: false },
  validatedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },

  // system's data about the operator
  operator: OperatorSchema,

  // system's data about the aom
  aom: [AomSchema],

});

module.exports = mongoose.model('Proof', ProofSchema);
