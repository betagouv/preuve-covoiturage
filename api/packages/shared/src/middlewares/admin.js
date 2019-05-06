const { isAdmin } = require('@pdc/service-user').user.helpers;
const UnauthorizedError = require('../errors/unauthorized');
const ForbiddenError = require('../errors/forbidden');

const admin = function admin(req, res, next) {
  if (!req.user) {
    throw new UnauthorizedError('Connected user required');
  }

  if (!isAdmin(req.user)) {
    throw new ForbiddenError('Admin expected');
  }

  next();
};

module.exports = admin;
