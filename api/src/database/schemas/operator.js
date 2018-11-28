const mongoose = require('mongoose');

const { Schema } = mongoose;

const OperatorSchema = new Schema({
  id: { type: Schema.Types.ObjectId, index: true },
  name: String,
  siren: String,
});

module.exports = OperatorSchema;
