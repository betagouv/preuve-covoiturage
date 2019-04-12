const passport = require('passport');
const Token = require('@pdc/service-organization/entities/models/token');
const UnauthorizedError = require('../errors/unauthorized');

const jwtServer = async (req, res, next) => {
  // check for the token in the blacklist
  const token = req.headers.authorization.toString().replace('Bearer ', '');

  if (await Token.findOne({ token }).exec()) {
    return next(new UnauthorizedError());
  }

  // authenticate the server as operator
  return passport.authenticate('jwtServer', { session: false }, (err, user) => {
    if (err) return next(err);

    req.operator = user.operator;
    req.permissions = user.application.permissions;

    return next(null, user);
  })(req, res, next);
};

module.exports = jwtServer;
