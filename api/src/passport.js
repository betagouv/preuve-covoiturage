const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const config = require("./config");

// load up the user model
const User = require("./users/userModel");

module.exports = function (passport) {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("Bearer");
  opts.secretOrKey = config.secret;
  passport.use(
    new JwtStrategy(opts, function (jwtPayload, next) {
      User.findOne({ _id: jwtPayload._id }, function (err, user) {
          if (err) {
            return next(err, false);
          }

          if (user) {
            next(null, user);
          } else {
            next(null, false);
          }
        }
      );
    })
  );
};
