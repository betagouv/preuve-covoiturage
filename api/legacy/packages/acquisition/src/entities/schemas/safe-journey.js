const mongoose = require('mongoose');
const journeyOperator = require('./journey-operator');

const { Schema } = mongoose;

const SafeJourneySchema = new Schema(Object.assign(
  { duplicatedAt: Date },
  journeyOperator,
), { timestamps: true, id: false });

export default SafeJourneySchema;
