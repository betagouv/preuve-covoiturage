const router = require('express').Router();
const { getStats } = require('../service');

router.get('/', async (req, res, next) => {
  try {
    res.json(await getStats());
  } catch (e) {
    next(e);
  }
});

module.exports = router;
