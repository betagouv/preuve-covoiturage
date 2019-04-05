const _ = require('lodash');
const multer = require('multer');
const router = require('express').Router();
const journeyService = require('./service');
const can = require('../../middlewares/can');
const jwtUser = require('../../middlewares/jwt-user');
const jwtServer = require('../../middlewares/jwt-server');
const acceptCsv = require('../../middlewares/accept-csv');
const { apiUrl } = require('../../packages/url/url');
const { importMaxFileSizeMb } = require('../../config');
const Journey = require('./model');

// Upload middleware
const upload = multer({
  dest: '/tmp/',
  limits: {
    fileSize: parseInt(importMaxFileSizeMb, 10) * 1024 * 1024, // 5MB
  },
});

router.get('/aom', jwtUser, can('journey.list'), async (req, res, next) => {
  try {
    const aoms = await Journey
      .aggregate([
        {
          $unwind: {
            path: '$aom',
            preserveNullAndEmptyArrays: false,
          },
        }, {
          $project: {
            _id: '$aom._id',
            name: '$aom.name',
          },
        }, {
          $group: {
            _id: {
              _id: '$_id',
              name: '$name',
            },
            count: {
              $sum: 1,
            },
          },
        }, {
          $sort: {
            '_id.name': 1,
          },
        },
      ])
      .exec();

    res.json(aoms.map(aom => ({
      _id: aom._id._id,
      name: aom._id.name,
      count: aom.count,
    })));
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
      deleted: !!await journeyService.softDelete(req.params.id),
    });
  } catch (e) {
    next(e);
  }
});

router.get('/', jwtUser, ...acceptCsv, can('journey.list'), async (req, res, next) => {
  try {
    // filter by operator
    const operator = _.get(req, 'user.operator');
    if (operator) {
      req.query.filter = _.assign(req.query.filter, { 'operator._id': operator });
    }

    // filter by AOM
    const aom = _.get(req, 'user.aom');
    if (aom) {
      req.query.filter = _.assign(req.query.filter, { 'aom._id': aom });
    }

    res.json(await journeyService.find(req.query));
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

router.post('/import', upload.single('csv'), jwtUser, can('journey.import'), async (req, res, next) => {
  try {
    // get operator from connected user
    if (!_.get(req, 'body.operator') && _.get(req, 'user.operator')) {
      _.set(req, 'body.operator', _.get(req, 'user.operator._id').toString());
    }

    const results = await journeyService.import(req.body, req.file);

    res
      .status(results.failed.length ? 400 : 200)
      .json(results);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
