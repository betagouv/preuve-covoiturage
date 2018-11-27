const router = require('express').Router();
const _ = require('lodash');
const Journey = require('./journey-model');
const journeyService = require('./journey-service');

/**
 * Download a collection of journeys in a format (default csv)
 * Scope results by AOM or Operator
 * Pass format as ?format={csv}
 */
router.get('/download', async (req, res, next) => {
  try {
    const query = {};

    if (_.has(req, 'aom.siren')) {
      query['aom.siren'] = req.aom.siren;
    }

    if (_.has(req, 'operator.siren')) {
      query['operator.siren'] = req.operator.siren;
    }

    res
      .set('Content-type', 'text/csv')
      .send(await journeyService.convert(await Journey.find(query), 'csv'));
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    res.json(await journeyService.find({ _id: req.params.id }));
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    res.json(await journeyService.update(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    res.json(await journeyService.delete(req.params.id));
  } catch (e) {
    next(e);
  }
});

router.get('/', async (req, res, next) => {
  try {
    res.json(await journeyService.find({}));
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    res.json(await journeyService.create(_.assign(
      req.body,
      { operator: req.operator },
    )));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
