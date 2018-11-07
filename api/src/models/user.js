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
  institution: { type: String, required: true },
  nom: { type: String },
  prenom: { type: String },
  group: { type: String, required: true },
  role: { type: String, required: true },
  password: { type: String, required: true },
  hasResetPassword: { type: Boolean, default: true },
  lastConnectedAt: { type: Date }
});

UserSchema.pre("save", function(next) {
  if (this.isModified("password") || this.isNew) {
    bcrypt.hash(this.password, 10, (e, hash) => {
      this.password = hash;
      next();
    });
  } else {
    return next();
  }
});

UserSchema.method("toJSON", function() {
  var user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
});

UserSchema.methods.comparePassword = function(passw, cb) {
  bcrypt.compare(passw, this.password, function(err, res) {
    if (err) {
      return cb(err);
    }
    cb(null, res);
  });
};

module.exports = mongoose.model("User", UserSchema);
