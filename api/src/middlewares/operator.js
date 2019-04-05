const { has } = require('lodash');
const UnauthorizedError = require('../packages/errors/unauthorized');
const ForbiddenError = require('../packages/errors/forbidden');
const { isSuperAdmin, isOperator } = require('../routes/users/helpers');

const operator = function operator(req, res, next) {
  if (!req.user) {
    throw new UnauthorizedError('An operator requires a connected user');
  }

  const user = req.user.toObject();

  if (isSuperAdmin(user)) {
    return next();
  }

  if (!has(user, 'operator')) {
    throw new Error('No operator defined in the user');
  }

  if (!isOperator(user)) {
    throw new ForbiddenError('User is not an Operator');
  }

  return next();
};

module.exports = operator;
