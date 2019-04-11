const mongoose = require('mongoose');
const rank = require('./rank');
const aom = require('./aom');

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

module.exports = {
  safe_journey_id: { type: ObjectId, index: true },
  trip_id: { type: ObjectId, index: true },

  status: {
    type: String,
    trim: true,
    lowercase: true,
    enum: ['pending', 'accepted', 'refused', 'error', 'processed'],
    default: 'pending',
  },

  validation: {
    step: { type: Number, default: 0 },
    validated: { type: Boolean, default: false },
    validatedAt: { type: Date, default: null },
    tests: { type: Schema.Types.Mixed, default: {} },
    rank,
  },

  aom: [aom],

  deletedAt: { type: Date, default: null },
};
