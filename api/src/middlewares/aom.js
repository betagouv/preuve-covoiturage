const { has } = require('lodash');

const aom = function aom(req, res, next) {
  if (!req.user) {
    throw new Error('An AOM requires a connected user');
  }

  if (!has(req, 'user.aom')) {
    throw new Error('No AOM defined in the user');
  }

  next();
};

module.exports = aom;
