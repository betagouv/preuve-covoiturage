const { isSuperAdmin } = require('@pdc/service-user').user.helpers;
const { UnauthorizedError, ForbiddenError } = require('@pdc/shared-errors/src/unauthorized');

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
