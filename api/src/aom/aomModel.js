const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AomSchema = new Schema({
  siren: { type: String, required: true },
  // TODO geo
});

module.exports = moogoose.model("Aom", AomSchema);
