const _ = require('lodash');

const config = {
  perPage: 25,
  defaultPage: 1,
  defaultLimit: 25,
  maxLimit: 1000,
};

function castPage(page) {
  const p = parseInt(page, 10);

  if (_.isNaN(p)) return config.defaultPage;

  return Math.abs(p) || config.defaultPage;
}

function castLimit(limit) {
  let lim = parseInt(limit, 10);

  if (_.isNaN(lim)) return config.defaultLimit;

  lim = Math.abs(lim) || config.defaultLimit;

  return lim > config.maxLimit ? config.maxLimit : lim;
}

function paginate(query = {}) {
  const limit = castLimit(query.limit);
  const skip = (castPage(query.page) - 1) * limit;

  return { skip, limit };
}

export default paginate;
