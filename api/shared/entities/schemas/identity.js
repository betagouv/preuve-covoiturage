const { regex, setters, validators } = require('@pdc/shared/packages/mongo/schema-validation');

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
};
