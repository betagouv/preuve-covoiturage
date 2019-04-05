const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const IncentiveCampaignSchema = new Schema({
  aom: {
    type: ObjectId,
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    trim: true,
    lowercase: true,
    enum: ['pending', 'validated', 'paid'],
    default: 'pending',
    required: true,
  },
  policies: [ObjectId], // IncentivePolicy
  trips: [ObjectId],
  deletedAt: { type: Date },
}, { timestamps: true, id: false });

module.exports = IncentiveCampaignSchema;
