const mongoose = require('mongoose');
const { regex, setters, validators } = require('../../providers/mongo/schema-validation');

const { Schema } = mongoose;

const CardSchema = new Schema({
  name: {
    type: String,
    lowercase: true,
    trim: true,
    minlength: 2,
    maxlength: 128,
    set: setters.cardName,
  },
  number: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 64,
  },
}, { id: false, _id: false });

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
  card: {
    type: CardSchema,
    required: false,
  },
};
