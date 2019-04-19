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

    const anon = data.map(line => Object
      .keys(line)
      .reduce((acc, key) => {
        const val = line[key];

        // remove GDPR data by keys
        // QUICK solution to be refactored
        // as a 'personal' key in the JSON Schema
        // #migrateme
        if (_.isObject(val) || [
          '_id',
          'createdAt',
          'updatedAt',
          'deletedAt',
          'operator._id',
          'name',
          'safe_journey_id',
          'trip_id',
          'status',
          'validation.rank',
          'validation.step',
          'validation.tests.hasProofs',
          'validation.validated',
          'validation.validatedAt',

          'driver.identity.firstname',
          'driver.identity.lastname',
          'driver.identity.phone',
          'driver.identity.email',
          'driver.identity.company',
          'driver.identity.card.number',
          'passenger.identity.firstname',
          'passenger.identity.lastname',
          'passenger.identity.phone',
          'passenger.identity.email',
          'passenger.identity.company',
          'passenger.identity.card.number',
          
          'driver.start.literal',
          'driver.end.literal',
          'passenger.start.literal',
          'passenger.end.literal',
        ].indexOf(key) > -1) {
          return acc;
        }

        acc[key] = val;

        return acc;
      }, {}));

    res.setHeader('Cache-Control', 'must-revalidate');
    res.setHeader('Pragma', 'must-revalidate');
    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${slugify(req.baseUrl)}-${Date.now()}.csv"`,
    );

    return json2csv(anon, { fields: Object.keys(anon[0]) });
  }),
];
