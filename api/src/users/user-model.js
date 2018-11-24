const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
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

UserSchema.pre('save', function save(next) {
  if (this.isModified('password') || this.isNew) {
    bcrypt.hash(this.password, 10, (e, hash) => {
      this.password = hash;
      next();
    });
  } else {
    next();
  }
});

UserSchema.method('toJSON', function toJSON() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
});

UserSchema.methods.comparePassword = function comparePassword(passw, cb) {
  bcrypt.compare(passw, this.password, (err, res) => {
    if (err) {
      cb(err);
    } else {
      cb(null, res);
    }
  });
};

UserSchema.methods.setOperator = async function setOperator(operator) {
  this.operator = operator;
  return this;
};

UserSchema.methods.unsetOperator = async function unsetOperator() {
  this.operator = null;
  return this;
};

UserSchema.methods.setAom = async function setAom(aom) {
  this.aom = aom;
  return this;
};

UserSchema.methods.unsetAom = async function unsetAom() {
  this.aom = null;
  return this;
};

module.exports = mongoose.model('User', UserSchema);
