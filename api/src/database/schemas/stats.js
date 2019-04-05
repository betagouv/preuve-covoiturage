/* eslint-disable no-useless-escape */
const { Schema } = require('mongoose');

const StatSchema = new Schema({
  name: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
    index: true,
  },
  key: {
    type: String,
    trim: true,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = StatSchema;
