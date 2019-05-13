const { has } = require('lodash');
const { isSuperAdmin, isAom } = require('@pdc/service-user').user.helpers;
const { UnauthorizedError, ForbiddenError } = require('@pdc/shared-errors/src/unauthorized');

const aom = function aom(req, res, next) {
  if (!req.user) {
    throw new UnauthorizedError('An AOM requires a connected user');
  }

  const user = req.user.toObject();

  if (isSuperAdmin(user)) {
    return next();
  }

  if (!has(user, 'aom')) {
    throw new Error('No AOM defined in the user');
  }

  if (!isAom(user)) {
    throw new ForbiddenError('User is not an AOM');
  }

  return next();
};

module.exports = aom;
