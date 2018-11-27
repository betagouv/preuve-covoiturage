const mongoose = require('mongoose');
const { ProofSchema, OperatorSchema, AomSchema, PositionSchema } = require('../proofs/proof-model');


const { Schema } = mongoose;



const ValidationSchema = new Schema({
  validated: {type: Boolean, default: false},
  validatedAt: {type: Date, default: null},
  class_tests: { type: Schema.Types.Mixed, default: {} },
  validation_tests: { type: Schema.Types.Mixed, default: {} },
  validation_class: { type: String, default: null, enum: ['A', 'B', 'C', 'D', null] }
});



//todo:  unique for a given operator_id and journey_id
const JourneySchema = new Schema({

  // operator's data
  journey_id: { type: String },
  driver: [
    {
    driver_id: Schema.Types.ObjectId, // Proof id from proof collection
    start: PositionSchema,
    end: PositionSchema,
    }
  ],
  passengers: [
    {
      passenger_id: Schema.Types.ObjectId, // Proof id from proof collection
      start: PositionSchema,
      end: PositionSchema,
    }
  ],
  trust_level: { type: Number, default: 0 }, // defined by operator
  passengers_count: { type: Number, default: 0 },

  // system's data
  proofs : [ProofSchema],
  validation: ValidationSchema,
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
  deletedAt: { type: Date, default: null },

  // system's data about the operator
  operator: OperatorSchema,

  // system's data about the aom
  aom: [AomSchema],

});


module.exports = mongoose.model('Journey', JourneySchema);
