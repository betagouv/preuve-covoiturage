const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const UnitSchema = require('./unit');
const ParameterSchema = require('./parameter');

const IncentiveTimeFilterSchema = new Schema({
  start: {
    type: String,
    required: true,
  },
  end: {
    type: String,
    required: true,
  },
}, { id: false });

const IncentivePolicySchema = new Schema({
  aom: {
    type: ObjectId,
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
    rank: [{
      type: String,
    }],
    insee: {
      whiteList: {
        start: [{
          type: String,
        }],
        end: [{
          type: String,
        }],
      },
      blackList: {
        start: [{
          type: String,
        }],
        end: [{
          type: String,
        }],
      },
    },
  },
  parameters: [ParameterSchema],
  formula: {
    type: String,
    required: true,
  },
  unit: {
    type: UnitSchema,
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
}, { timestamps: true, id: false });

export default IncentivePolicySchema;
