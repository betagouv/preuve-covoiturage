const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const config = require('./config');

// load up the user model
const User = require('./users/user-model');

module.exports = function (passport) {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('Bearer');
  opts.secretOrKey = config.secret;
  passport.use(
    new JwtStrategy(opts, ((jwtPayload, next) => {
      User.findOne({ _id: jwtPayload._id }, (err, user) => {
        if (err) {
          next(err, false);
        } else {
          next(null, user || false);
        }
      });
    })),
  );
};
