const mongoose = require('mongoose');
const { regex } = require('@pdc/shared/providers/mongo/schema-validation');


const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const UnitSchema = require('../schemas/unit');
const ParameterSchema = require('../schemas/parameter');


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
        and: {
          start: [{
            type: String,
            trim: true,
            uppercase: true,
            match: regex.insee,
          }],
          end: [{
            type: String,
            trim: true,
            uppercase: true,
            match: regex.insee,
          }],
        },
        or: {
          start: [{
            type: String,
            trim: true,
            uppercase: true,
            match: regex.insee,
          }],
          end: [{
            type: String,
            trim: true,
            uppercase: true,
            match: regex.insee,
          }],
        },
      },
      blackList: {
        and: {
          start: [{
            type: String,
            trim: true,
            uppercase: true,
            match: regex.insee,
          }],
          end: [{
            type: String,
            trim: true,
            uppercase: true,
            match: regex.insee,
          }],
        },
        or: {
          start: [{
            type: String,
            trim: true,
            uppercase: true,
            match: regex.insee,
          }],
          end: [{
            type: String,
            trim: true,
            uppercase: true,
            match: regex.insee,
          }],
        },
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

module.exports = IncentivePolicySchema;
