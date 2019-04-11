const _ = require('lodash');
const mung = require('express-mung');
const flat = require('flat');
const slugify = require('slugify');
const json2csv = require('json2csv').parse;

module.exports = [
  // pre middleware to transform the query
  (req, res, next) => {
    if (req.get('Accept') !== 'text/csv') {
      next();
    } else {
      // change limit and skip values for CSV export
      const limit = _.get(req, 'query.limit', 1000);
      const skip = _.get(req, 'query.skip', 1000);

      req.query.limit = limit > 10000 ? 10000 : Math.abs(limit);
      req.query.skip = skip > 100 ? 100 : Math.abs(skip);

      next();
    }
  },

  // post middleware to transform the response
  mung.json((body, req, res) => {
    if (req.get('Accept') !== 'text/csv') {
      return body;
    }

    const data = _.get(body, 'data', [])
      .map(i => (i.toCSV ? i.toCSV() : i))
      .map(flat);

    res.setHeader('Cache-Control', 'must-revalidate');
    res.setHeader('Pragma', 'must-revalidate');
    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${slugify(req.baseUrl)}-${Date.now()}.csv"`,
    );

    return json2csv(data, { fields: Object.keys(data[0]) });
  }),
];
