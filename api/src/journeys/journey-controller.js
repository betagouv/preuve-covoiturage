const router = require('express').Router();
const journeyService = require('./journey-service');

router.get('/:id', async (req, res, next) => {
  try {
    res.json(await journeyService.find({ _id: req.params.id }));
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

module.exports = router;
