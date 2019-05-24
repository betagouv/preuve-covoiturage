/* eslint-disable no-useless-escape */
const { Schema } = require('mongoose');

const StatSchema = new Schema(
  {
    coll: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      index: true,
    },
    key: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      index: true,
    },
    value: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true, id: false },
);

module.exports = StatSchema;
