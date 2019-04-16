const mongoose = require('mongoose');
const UnitSchema = require('./objects/incentive-unit');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const IncentiveSchema = new Schema({
  operator: {
    type: ObjectId, // Operator
    required: true,
    index: true,
  },
  campaign: {
    type: ObjectId, // IncentiveCampaign
    required: true,
  },
  target: {
    type: ObjectId, // person
    required: true,
  },
  trip: {
    type: ObjectId, // trip
    required: true,
  },
  unit: {
    type: UnitSchema, // IncentiveUnit
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    trim: true,
    lowercase: true,
    enum: ['pending', 'validated', 'consumed'],
    default: 'pending',
    required: true,
  },
  deletedAt: { type: Date },
}, { timestamps: true, id: false });

module.exports = IncentiveSchema;
