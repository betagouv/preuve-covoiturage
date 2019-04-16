/* eslint-disable no-useless-escape */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const TokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
}, { timestamps: true, id: false });

module.exports = TokenSchema;
