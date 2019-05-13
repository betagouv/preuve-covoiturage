const { Schema } = require('mongoose');

const { ObjectId } = Schema.Types;

module.exports = {
  type: new Schema({
    _id: { type: ObjectId, index: true },
    name: { type: String, trim: true },
    shortname: { type: String, trim: true },
    span: { type: Number, min: 0, default: 0 },
  }, { id: false }),
  required: false,
};
