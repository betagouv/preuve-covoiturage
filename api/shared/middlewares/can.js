const UnauthorizedError = require('@pdc/shared/packages/errors/unauthorized');
const ForbiddenError = require('@pdc/shared/packages/errors/forbidden');
const { isSuperAdmin } = require('../routes/users/helpers');

const can = (...perms) => (req, res, next) => {
  if (!Array.isArray(perms)) {
    throw new ForbiddenError('No permissions defined');
  }

  let permissions = [];

  // check for user, super-admin and its permissions
  if (req.user) {
    const user = req.user.toObject();

    if (isSuperAdmin(user)) return next();

    // eslint-disable-next-line prefer-destructuring
    permissions = user.permissions;
  } else {
    // otherwise check request permissions
    if (!req.permissions) {
      throw new UnauthorizedError('Connected user required');
    }

    // eslint-disable-next-line prefer-destructuring
    permissions = req.permissions;
  }

  perms.forEach((perm) => {
    if (permissions.indexOf(perm) === -1) {
      throw new ForbiddenError(`Missing ${perm} permission`);
    }
  });

  return next();
};

module.exports = can;
