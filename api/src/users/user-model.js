const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  lastname: String,
  firstname: String,
  phone: String,
  group: {
    type: String,
    required: true,
    enum: ['aom', 'operators', 'registry'],
  },
  role: { type: String, required: true },
  permissions: { type: [String], required: true },
  password: { type: String, required: true },
  hasResetPassword: { type: Boolean, default: true },
  lastConnectedAt: { type: Date },

  operator: Schema.Types.ObjectId,
  aom: Schema.Types.ObjectId,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
});

UserSchema.pre("save", function (next) {
  if (this.isModified("password") || this.isNew) {
    bcrypt.hash(this.password, 10, (e, hash) => {
      this.password = hash;
      next();
    });
  } else {
    return next();
  }
});

UserSchema.method("toJSON", function () {
  var user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
});

UserSchema.methods.comparePassword = function (passw, cb) {
  bcrypt.compare(passw, this.password, function (err, res) {
    if (err) {
      return cb(err);
    }
    cb(null, res);
  });
};

UserSchema.methods.setOperator = async function (operator) {
  this.operator = operator;
  return this;
};

UserSchema.methods.unsetOperator = async function () {
  this.operator = null;
  return this;
};

UserSchema.methods.setAom = async function (aom) {
  this.aom = aom;
  return this;
};

UserSchema.methods.unsetAom = async function () {
  this.aom = null;
  return this;
};

module.exports = mongoose.model("User", UserSchema);
