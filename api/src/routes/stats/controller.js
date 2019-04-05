const router = require('express').Router();
const statService = require('./service');

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
