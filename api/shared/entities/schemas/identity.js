const mongoose = require('mongoose');
const { regex, setters, validators } = require('../../providers/mongo/schema-validation');

const CardSchema = new Schema({
  name: { type: String },
  number: { type: String, required: true },
});

module.exports = {
  firstname: {
    type: String,
    trim: true,
  },
  lastname: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    match: regex.email,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    match: regex.phone,
    set: setters.phone,
    validate: validators.phone,
    trim: true,
  },
  company: { type: String, trim: true },
  over_18: { type: Boolean, default: null },
  cards: {
    type: [CardSchema],
    required: false,
  },
};
