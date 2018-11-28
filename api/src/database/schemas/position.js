const mongoose = require('mongoose');

const { Schema } = mongoose;

const PositionSchema = new Schema({
  lat: Number,
  lng: Number,
  date: Date,
  insee: String,
  literal: String,
});

module.exports = PositionSchema;
