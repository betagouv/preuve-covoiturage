const { has } = require("lodash");

const operator = function operator(req, res, next) {
  if (!req.user) {
    throw new Error('An operator requires a connected user');
  }

  if (!has(req, 'user.operator')) {
    throw new Error('No operator defined in the user');
  }

  next();
};

module.exports = operator;
