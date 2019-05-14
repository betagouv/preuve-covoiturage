const _ = require('lodash');
const multer = require('multer');
const flat = require('flat');
const csv = require('csv');
const slugify = require('slugify');
const router = require('express').Router();

const can = require('@pdc/shared/middlewares/can');
const jwtUser = require('@pdc/shared/middlewares/jwt-user');
const jwtServer = require('@pdc/shared/middlewares/jwt-server');
const { apiUrl } = require('@pdc/shared/helpers/url/url')(process.env.APP_URL, process.env.API_URL);

const aomService = require('@pdc/service-organization/aom');

const journeyService = require('../service');
const Journey = require('../entities/models/journey');
const { importMaxFileSizeMb } = require('../config');
const { anonymize } = require('../lib/anonymize');

// Upload middleware
const upload = multer({
  dest: '/tmp/',
  limits: {
    fileSize: parseInt(importMaxFileSizeMb, 10) * 1024 * 1024, // 5MB
  },
});

router.get('/aom', jwtUser, can('journey.list'), async (req, res, next) => {
  try {
    const aoms = await Journey.aggregate([
      {
        $unwind: {
          path: '$aom',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: '$aom._id',
          name: '$aom.name',
        },
      },
      {
        $group: {
          _id: {
            _id: '$_id',
            name: '$name',
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          '_id.name': 1,
        },
      },
    ]).exec();

    res.json(
      aoms.map(aom => ({
        _id: aom._id._id,
        name: aom._id.name,
        count: aom.count,
      })),
    );
  } catch (e) {
    next(e);
  }
});

router.get('/process/:id', jwtUser, can('journey.process'), async (req, res, next) => {
  try {
    res.json(await journeyService.process({ safe_journey_id: req.params.id }));
  } catch (e) {
    next(e);
  }
});

router.get('/:id', jwtUser, can('journey.read'), async (req, res, next) => {
  try {
    res.json(await journeyService.find({ _id: req.params.id }));
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', jwtUser, can('journey.delete'), async (req, res, next) => {
  try {
    res.json({
      id: req.params.id,
      deleted: !!(await journeyService.softDelete(req.params.id)),
    });
  } catch (e) {
    next(e);
  }
});

router.get('/', jwtUser, can('journey.list'), async (req, res, next) => {
  try {
    // filter by operator
    const operator = _.get(req, 'user.operator');
    if (operator) {
      req.query.filter = _.assign(req.query.filter, { 'operator._id': operator });
    }

    // filter by AOM
    const aomId = _.get(req, 'user.aom');
    let authorizedOps = [];
    const filterOps = (doc) => {
      const d = doc;
      const oI = d.operator._id.toString();
      if (authorizedOps.indexOf(oI) === -1) {
        d.name = 'hidden';
        d.operator = { _id: null, nom_commercial: 'hidden' };
        d.operator_journey_id = null;
      }

      return d;
    };

    if (aomId) {
      const aomLean = await aomService.findOne(aomId, true);

      // filter operators in the query to let the user filter by
      // authorised operators only.
      if (aomLean && aomLean.authorised) {
        authorizedOps = aomLean.authorised
          .filter(o => o.coll === 'operators')
          .map(o => ((o && o._id) ? o._id.toString() : null))
          .filter(o => !!o);

        const filteredOps = (req.query['operator._id'] || '')
          .split(',')
          .filter(o => authorizedOps.indexOf(o) !== -1);

        if (filteredOps.length) {
          req.query['operator._id'] = filteredOps.join(',');
        } else {
          delete req.query['operator._id'];
        }
      }

      req.query.filter = _.assign(req.query.filter, { 'aom._id': aomId });
    }

    // CSV stream
    if (req.get('Accept') === 'text/csv') {
      res.setHeader(
        'Content-disposition',
        `attachment; filename=${slugify(req.baseUrl)}-${Date.now()}.csv`,
      );

      res.writeHead(200, {
        'Content-Type': 'text/csv;charset=utf-8',
        'Transfer-Encoding': 'chunked',
      });

      res.flushHeaders();

      const transformer = doc => anonymize(flat(filterOps(doc.toJSON())));

      // update limits
      req.query.limit = _.get(req, 'query.limit', 50000);
      req.query.skip = _.get(req, 'query.skip', 0);

      journeyService
        .findCursor(req.query)
        .pipe(csv.transform(transformer))
        .pipe(csv.stringify({ header: true }))
        .pipe(res);
    } else {
      // JSON response
      const response = await journeyService.find(req.query);
      response.data = response.data.map(filterOps);
      res.json(response);
    }
  } catch (e) {
    next(e);
  }
});

router.post('/', jwtUser, can('journey.create'), async (req, res, next) => {
  try {
    const opId = _.get(req, 'user.operator._id', null);
    const journey = await journeyService.create(req.body, opId);

    res
      .set('Location', apiUrl(`journeys/${journey._id.toString()}`))
      .status(201)
      .json(journey);
  } catch (e) {
    next(e);
  }
});

router.post('/push', jwtServer, can('journey.create'), async (req, res, next) => {
  try {
    const journey = await journeyService.create(req.body, req.operator);

    res
      .set('Location', apiUrl(`journeys/${journey._id.toString()}`))
      .status(201)
      .json(journey);
  } catch (e) {
    next(e);
  }
});

router.post(
  '/import',
  upload.single('csv'),
  jwtUser,
  can('journey.import'),
  async (req, res, next) => {
    try {
      // get operator from connected user
      if (!_.get(req, 'body.operator') && _.get(req, 'user.operator')) {
        _.set(req, 'body.operator', _.get(req, 'user.operator._id').toString());
      }

      const results = await journeyService.import(req.body, req.file);

      res.status(results.failed.length ? 400 : 200).json(results);
    } catch (e) {
      next(e);
    }
  },
);

module.exports = router;
