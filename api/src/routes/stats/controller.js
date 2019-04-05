const router = require('express').Router();
const statService = require('./service');

router.get('/', async (req, res, next) => {
  try {
    res.json({
      collected: {
        total: await statService.processors.journeysCollectedAllTimes(),
        month: await statService.processors.journeysCollectedPerMonth(),
        week: await statService.processors.journeysCollectedPerWeek(),
        day: await statService.processors.journeysCollectedPerDay(),
        dayOfWeek: await statService.processors.journeysCollectedPerDayOfWeek(),
      },
      distance: {
        total: await statService.processors.distanceAllTimes(),
        month: await statService.processors.distancePerMonth(),
        week: await statService.processors.distancePerWeek(),
        day: await statService.processors.distancePerDay(),
        dayOfWeek: await statService.processors.distancePerDayOfWeek(),
      },
      duration: {
        total: await statService.processors.durationAllTimes(),
        month: await statService.processors.durationPerMonth(),
        week: await statService.processors.durationPerWeek(),
        day: await statService.processors.durationPerDay(),
        dayOfWeek: await statService.processors.durationPerDayOfWeek(),
      },
      classes: {
        a: {
          total: await statService.processors.classAllTimes('A'),
          month: await statService.processors.classPerMonth('A'),
          week: await statService.processors.classPerWeek('A'),
          day: await statService.processors.durationPerDay(),

        },
        b: {
          total: await statService.processors.classAllTimes('B'),
          month: await statService.processors.classPerMonth('B'),
          week: await statService.processors.classPerWeek('B'),
          day: await statService.processors.classPerDay('B'),
        },
        c: {
          total: await statService.processors.classAllTimes('C'),
          month: await statService.processors.classPerMonth('C'),
          week: await statService.processors.classPerWeek('C'),
          day: await statService.processors.classPerDay('C'),
        },
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
