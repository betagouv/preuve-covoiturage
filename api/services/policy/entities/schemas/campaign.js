const mongoose = require('mongoose');

const policySchema = require('./policy');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const IncentivePolicyParameteredSchema = new Schema({
  policy: {
    type: policySchema,
    required: true,
  },
  parameters: [
    {
      key: {
        type: String,
        required: true,
      },
      value: {
        type: Schema.Types.Mixed,
        required: true,
      },
    },
  ],
});

const IncentiveCampaignSchema = new Schema(
  {
    aom: {
      type: ObjectId,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
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
      enum: ['draft', 'pending', 'active', 'archived'],
      default: 'pending',
      required: true,
    },
    policies: [IncentivePolicyParameteredSchema], // IncentivePolicy
    trips: [ObjectId],
    deletedAt: { type: Date },
  },
  { timestamps: true, id: false },
);

module.exports = IncentiveCampaignSchema;
