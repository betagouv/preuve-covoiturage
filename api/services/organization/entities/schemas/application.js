const mongoose = require('mongoose');
const toJSON = require('@pdc/shared/packages/mongo/to-json');

const { Schema } = mongoose;

const ApplicationSchema = new Schema({
  name: { type: String, max: 255, trim: true },
  permissions: [String],
}, { timestamps: true, id: false });

// eslint-disable-next-line func-names
ApplicationSchema.method('toJSON', function () {
  return toJSON(ApplicationSchema, this);
});

module.exports = ApplicationSchema;
