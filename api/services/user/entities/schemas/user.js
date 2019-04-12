/* eslint-disable no-useless-escape */
const mongoose = require('mongoose');
const { regex, setters, validators } = require('@pdc/shared/providers/mongo/schema-validation');

const { Schema } = mongoose;

const UserSchema = new Schema({
  email: {
    type: String,
    match: regex.email,
    trim: true,
    lowercase: true,
    unique: true,
    required: true,
  },
  lastname: {
    type: String,
    trim: true,
    required: true,
  },
  firstname: {
    type: String,
    trim: true,
    required: true,
  },
  phone: {
    type: String,
    match: regex.phone,
    set: setters.phone,
    validate: validators.phone,
    trim: true,
  },
  group: {
    type: String,
    trim: true,
    required: true,
    enum: ['aom', 'operators', 'registry'],
  },
  role: {
    type: String,
    trim: true,
    default: 'user',
    enum: ['admin', 'user'],
  },
  permissions: { type: [String], required: true },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 128,
    trim: false,
    hidden: true,
    crypt: true,
  },

  status: {
    type: String,
    trim: true,
    lowercase: true,
    enum: ['pending', 'invited', 'active', 'blocked'],
    default: 'pending',
  },

  hasResetPassword: { type: Boolean, default: false },
  forgottenReset: { type: String, index: true, hidden: true },
  forgottenToken: { type: String, crypt: true, hidden: true },
  forgottenAt: { type: Date },

  lastConnectedAt: { type: Date },

  operator: Schema.Types.ObjectId,
  aom: Schema.Types.ObjectId,

  options: { type: Object, default: {} },

  deletedAt: { type: Date },
}, { timestamps: true, id: false });

module.exports = UserSchema;
