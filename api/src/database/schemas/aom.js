const mongoose = require('mongoose');

const { Schema } = mongoose;

const AomSchema = new Schema({
  aom_id: Schema.Types.ObjectId,
  name: String,
  siren: String,
  journey_span: {
    type: Number,
    min: 0,
    max: 100,
  },
});


module.exports = AomSchema;
