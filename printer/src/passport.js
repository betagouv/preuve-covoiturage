const { ajv, InvalidTokenError } = require('./ajv');
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

// Configure Passport JWT auth
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.APP_JWT_SECRET || 'superSecret',
      audience: [...(process.env.APP_ALLOWED_API || 'http://localhost:8080').split(',').map((s) => s.trim())],
      issuer: process.env.APP_JWT_ISSUER || 'http://localhost:3000',
      ignoreExpiration: true,
    },
    (payload, done) => {
      done(null, payload);
    },
  ),
);

module.exports = { passport };
