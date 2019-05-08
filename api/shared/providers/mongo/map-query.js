const aqp = require('api-query-params');
const paginate = require('../../helpers/paginate/paginate');

function mapQuery(options = {}) {
  let skip;
  let projection;
  const { page, fields, disablePaginate, ...query } = options;
  let { filter, limit, sort } = options;

  if (!disablePaginate) {
    ({ skip, limit } = paginate({ limit, page }));
  }

  ({ filter, limit, sort, skip, projection } = aqp({
    ...query,
    filter,
    limit,
    sort,
    skip,
    fields,
  }));

  filter = Object.assign({ deletedAt: null }, filter || {});
  sort = sort || {};
  projection = Object.assign({ geometry: 0 }, projection || {});

  return { filter, limit, sort, skip, projection };
}

module.exports = mapQuery;
