const UnauthorizedError = require('../packages/errors/unauthorized');
const ForbiddenError = require('../packages/errors/forbidden');
const { isSuperAdmin } = require('../routes/users/helpers');

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
