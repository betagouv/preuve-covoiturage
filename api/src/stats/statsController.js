const router = require("express").Router();
const aomService = require("../aom/aomService");

router.get("/dummy", async (req, res, next) => {
  try {
    res.json(await aomService.find({}).limit(3));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
