const mongoose = require('mongoose');
const journeyOperator = require('./journey-operator');
const journeySystem = require('./journey-system');

const { Schema } = mongoose;

const JourneySchema = new Schema(Object.assign(
  {},
  journeyOperator,
  journeySystem,
), { timestamps: true, id: false });

export default JourneySchema;
