const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const IncentiveTimeFilterSchema = new Schema({
  start: {
    type: String,
    required: true,
  },
  end: {
    type: String,
    required: true,
  },
});

const IncentivePolicySchema = new Schema({
  aom: {
    type: ObjectId,
    required: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  description: { type: String },
  rules: {
    weekday: [{
      type: Number,
    }],
    time: [IncentiveTimeFilterSchema],
    range: {
      min: Number,
      max: Number,
    },
    minRank: Number,
  },
  parameters: [{
    parameter: ObjectId, // IncentiveParameter
    value: Schema.Types.Mixed,
  }],
  formula: {
    type: String,
    required: true,
  },
  unit: {
    type: ObjectId,
    required: true,
  },
  status: {
    type: String,
    trim: true,
    lowercase: true,
    enum: ['draft', 'active', 'archived'],
    default: 'draft',
    required: true,
  },
  deletedAt: { type: Date },
}, { timestamps: true });

module.exports = IncentivePolicySchema;
