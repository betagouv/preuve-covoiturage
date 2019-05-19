const router = require('express').Router();
const mongoConnection = require('@pdc/proxy/mongo');
const statService = require('../service');
const bus = require('./bus');

const { journeysCollectedAllTimes } = require('../calculators/journeys-all-times');

const calculator = require('../calculator')(mongoConnection, bus, {
  journeysCollectedAllTimes,
});

router.get('/test', async (req, res, next) => {
  try {
    res.json({
      collected: await calculator('journeysCollectedAllTimes'),
    });
  } catch (e) {
    next(e);
  }
});

router.get('/', async (req, res, next) => {
  try {
    res.json({
      collected: await statService.journeysCollected(),
      distance: await statService.distance(),
      duration: await statService.duration(),
      classes: {
        a: await statService.class('A'),
        b: await statService.class('B'),
        c: await statService.class('C'),
      },
      unvalidated: {
        total: [],
        month: [],
        day: [],
      },
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
