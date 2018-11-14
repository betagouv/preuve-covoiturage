const router = require("express").Router();
const config = require("@pdc/config");

router.get("/dummy", async (req, res) => {
  res.json(config.proofsDummy);
});

module.exports = router;
