const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const config = require('./config');

// load up the user model
const User = require('./users/user-model');

module.exports = function (passport) {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.secret;
  opts.algorithms = ['HS256', 'HS384', 'HS512'];
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
