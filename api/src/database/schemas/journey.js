const mongoose = require('mongoose');
const journeyOperator = require('./objects/journey-operator');
const journeySystem = require('./objects/journey-system');

const { Schema } = mongoose;

const JourneySchema = new Schema(Object.assign(
  {},
  journeyOperator,
  journeySystem,
), { timestamps: true, id: false });

module.exports = JourneySchema;
