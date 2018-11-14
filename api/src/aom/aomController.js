const router = require("express").Router();
const config = require("@pdc/config");
const { CsvConverter } = require("@pdc/proof-helpers");

router.get("/values", async (req, res) => {
  // TODO return real values
  res.json(config.proofsDummy);
});

router.get("/csv", async (req, res) => {
  const csv = new CsvConverter([
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  ], config.proofsCsv);

  try {
    const data = await csv.convert();
    res.set('Content-type', 'text/csv').send(data);
  } catch (e) {
    res.json(err);
  }
});

module.exports = router;
