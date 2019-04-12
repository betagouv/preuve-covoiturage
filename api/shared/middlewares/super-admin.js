const { isSuperAdmin } = require('@pdc/service-user/helpers');
const UnauthorizedError = require('../errors/unauthorized');
const ForbiddenError = require('../errors/forbidden');

const superAdmin = function superAdmin(req, res, next) {
  if (!req.user) {
    throw new UnauthorizedError('Connected user required');
  }

  if (!isSuperAdmin(req.user)) {
    throw new ForbiddenError('Super admin expected');
  }

  next();
};

module.exports = superAdmin;
