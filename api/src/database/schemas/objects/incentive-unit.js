const mongoose = require('mongoose');

const { Schema } = mongoose;

module.exports = new Schema({
  name: {
    type: String,
    required: true,
  },
  short_name: {
    type: String,
    required: true,
  },
  description: String,
  aom: Schema.Types.ObjectId, // facultatif
  financial: {
    type: Boolean,
    default: true,
    required: true,
  },
  precision: {
    type: Number,
    default: 0,
    required: true,
  },
}, { id: false });
