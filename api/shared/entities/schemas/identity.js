const mongoose = require('mongoose');
const { regex, setters, validators } = require('../../providers/mongo/schema-validation');

const { Schema } = mongoose;

const CardSchema = new Schema(
  {
    name: {
      type: String,
      lowercase: true,
      trim: true,
      minlength: 2,
      maxlength: 128,
      set: setters.cardName,
      validate: validators.cardName,
    },
    user_id: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 64,
    },
  },
  { id: false, _id: false },
);

const IdentitySchema = new Schema(
  {
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
    travel_pass: {
      type: CardSchema,
      required: false,
    },
  },
  { id: false, _id: false },
);

module.exports = IdentitySchema;
