const _ = require('lodash');
const { ExtractJwt } = require('passport-jwt');
const JwtStrategy = require('passport-jwt').Strategy;
const NotFoundError = require('./packages/errors/not-found');
const config = require('./config');

// load the models
const User = require('./routes/users/model');
// const Operator = require('./routes/operators/model');
const operatorService = require('./routes/operators/service');
const applicationService = require('./routes/operators/applications/service');

module.exports = (passport) => {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.jwtSecret;
  opts.algorithms = ['HS256'];

  const jwtServer = new JwtStrategy(opts, async (jwtPayload, next) => {
    try {
      const op = await operatorService.findOne(jwtPayload.id);

      if (!op) {
        throw new Error(`Operator not found: ${jwtPayload.id}`);
      }

      const ap = await applicationService.findOne(jwtPayload.id, jwtPayload.app);

      if (!ap) {
        throw new NotFoundError(`Application not found: ${jwtPayload.app}`);
      }

      const results = {};
      if (_.has(op, '_doc')) {
        results.operator = op.toObject();
      }

      if (_.has(ap, '_doc')) {
        results.application = ap.toJSON();
      }

      next(null, results);
    } catch (e) {
      next(e);
    }
  });

  jwtServer.name = 'jwtServer';

  const jwtUser = new JwtStrategy(opts, (async (jwtPayload, next) => {
    try {
      const user = await User.findOne({ _id: jwtPayload._id }).exec();

      next(null, user);
    } catch (e) {
      next(e);
    }
  }));

  passport.use(jwtUser);
  passport.use(jwtServer);
};
