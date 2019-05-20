const router = require('express').Router();
const mongoConnection = require('@pdc/proxy/mongo');
const statService = require('../service');
const bus = require('./bus');

const { journeysCollectedAllTimes } = require('../calculators/journeys-all-times');
// const { journeysCollectedPerMonth } = require('../calculators/journeys-per-month');
// const { journeysCollectedPerWeek } = require('../calculators/journeys-per-week');
const { journeysCollectedPerDay } = require('../calculators/journeys-per-day');
// const { journeysCollectedPerDayOfWeek } = require('../calculators/journeys-per-day-of-week');

const { distanceAllTimes } = require('../calculators/distance-all-times');
const { distancePerDay } = require('../calculators/distance-per-day');

const { durationAllTimes } = require('../calculators/duration-all-times');
const { durationPerDay } = require('../calculators/duration-per-day');

const calculator = require('../calculator')(mongoConnection, bus, {
  journeysCollectedAllTimes,
  // journeysCollectedPerMonth,
  // journeysCollectedPerWeek,
  journeysCollectedPerDay,
  // journeysCollectedPerDayOfWeek,
  distanceAllTimes,
  distancePerDay,
  durationAllTimes,
  durationPerDay,
});

router.get('/test', async (req, res, next) => {
  try {
    res.json({
      collected: {
        total: await calculator('journeysCollectedAllTimes'),
        // month: await calculator('journeysCollectedPerMonth'),
        // week: await calculator('journeysCollectedPerWeek'),
        day: await calculator('journeysCollectedPerDay'),
        // dayOfWeek: await calculator('journeysCollectedPerDayOfWeek'),
      },
      distance: {
        total: await calculator('distanceAllTimes'),
        day: await calculator('distancePerDay'),
      },
      duration: {
        total: await calculator('durationAllTimes'),
        day: await calculator('durationPerDay'),
      },
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
