const mongoose = require('mongoose');
const { AomSchema } = require('@pdc/service-organization').entities.schemas;
const { identity: IdentitySchema, position, rank } = require('@pdc/shared-entities').schemas;
const { validators } = require('@pdc/shared-providers').mongo.schemas;

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const PersonSchema = new Schema({
  journey_id: { type: String, required: true },

  class: rank,
  operator_class: rank,
  operator: {
    _id: ObjectId,
    nom_commercial: { type: String, alias: 'name' },
  },

  is_driver: {
    type: Boolean,
    required: true,
    default: false,
  },

  identity: { type: IdentitySchema },

  start: { type: position, validate: validators.position, required: true },
  end: { type: position, validate: validators.position, required: true },
  distance: { type: Number, min: 0, default: 0 },
  duration: { type: Number, min: 0, default: 0 },

  seats: { type: Number, min: 1, default: 1 },
  cost: { type: Number, min: 0, default: 0 },
  incentive: { type: Number, min: 0, default: 0 },
  remaining_fee: { type: Number, min: 0, default: 0 },
  contribution: { type: Number, min: 0, default: 0 },
  revenue: { type: Number, min: 0, default: 0 },
  expense: { type: Number, min: 0, default: 0 },

  validation: {
    step: { type: Number, default: 0 },
    validated: { type: Boolean, default: false },
    validatedAt: { type: Date, default: null },
    tests: { type: Schema.Types.Mixed, default: {} },
    rank,
  },
}, { _id: false, id: false });

const IncentiveSchema = new Schema({
  incentive_id: { type: ObjectId },
  distributor: { type: ObjectId },
  status: {
    type: String,
    enum: ['draft', 'pending', 'processed'],
    default: 'draft',
    trim: true,
    lowercase: true,
  },
}, { _id: false, id: false });

const TripSchema = new Schema({
  operator_id: {
    type: ObjectId,
    index: true,
  },
  operator_journey_id: {
    type: String,
    index: true,
  },
  aom: [AomSchema],
  status: {
    type: String,
    enum: ['pending', 'active', 'error'],
    default: 'pending',
    trim: true,
    lowercase: true,
  },
  start: Date,
  people: [PersonSchema],
  incentives: [IncentiveSchema],
}, { timestamps: true, id: false });

module.exports = TripSchema;
