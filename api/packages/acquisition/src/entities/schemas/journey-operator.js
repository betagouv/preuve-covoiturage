const mongoose = require('mongoose');
const { identity, position, rank } = require('@pdc/shared-entities').schemas;
const { validators } = require('@pdc/shared-providers').mongo;

const { Schema } = mongoose;

const schema = {
  _id: { auto: false },
  identity: { type: identity },
  start: { type: position, validate: validators.position, required: true },
  end: { type: position, validate: validators.position, required: true },
  distance: { type: Number, min: 0, default: 0 },
  duration: { type: Number, min: 0, default: 0 },
  cost: { type: Number, min: 0, default: 0 },
  incentive: { type: Number, min: 0, default: 0 },
  remaining_fee: { type: Number, min: 0, default: 0 },
};

const PassengerSchema = new Schema(Object.assign({}, schema, {
  contribution: { type: Number, min: 0, default: 0 },
  seats: { type: Number, min: 1, default: 1 },
}), { _id: false, id: false });

const DriverSchema = new Schema(Object.assign({}, schema, {
  revenue: { type: Number, min: 0, default: 0 },
  expense: { type: Number, min: 0, default: 0 },
}), { _id: false, id: false });

module.exports = {
  journey_id: { type: String, trim: true, unique: true },
  operator_journey_id: { type: String, trim: true, index: true },

  operator_class: rank,

  operator: {
    _id: Schema.Types.ObjectId,
    nom_commercial: { type: String, alias: 'name' },
  },

  passenger: {
    type: PassengerSchema,
    required: true,
  },

  driver: {
    type: DriverSchema,
    required: false,
  },
};
